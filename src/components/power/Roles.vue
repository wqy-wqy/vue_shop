<template>
<div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button class="add-btn" @click="addDialogVisible=true">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区域 -->
        <!-- 查询角色列表 -->
        <el-table :data="rolesList" border stripe>
            <!-- 添加展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row :class="['bdtoom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <el-col :span='5'>
                            <el-tag closable @close="removeRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="19">
                            <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success" closable @close="removeRight(scope.row,item1.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRight(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>

            </el-table-column>
            <!-- 添加索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <!-- 添加按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoles(scope.row.id)">编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
                    <!-- 分配角色按钮 -->
                    <el-button type="info" icon="el-icon-delete" size="mini" @click="showRight(scope.row)">分配权限</el-button>

                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 对话框区域 -->
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="45%" @close="rolesReset">
        <!-- 内容主体区域 -->
        <el-form :model="rolesForm" :rules="rolesFormRules" ref="rolesFormRef" class="demo-ruleForm" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="rolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="rolesForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 添加角色编辑对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="45%" @close="editClose">
        <!-- 内容主体区域 -->
        <el-form :model="editRolesForm" :rules="editRolesFormRules" ref="editRolesFormRef" class="demo-ruleForm" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editRolesForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false" @close="editClose">取 消</el-button>
            <el-button type="primary" @click="editInfo">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="addRightDialogVisible" width="45%" @close="setRightDialog">
        <!-- 内容主体区域 -->
        <el-tree :data="rightList" :props="RightProps" show-checkbox node-key="id" :default-checked-keys="defkeys" ref="treeRef"></el-tree>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="applyRight">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            rolesList: [],
            rightList: [],
            // 存储默认选中的权限
            defkeys: [],
            addDialogVisible: false,
            editDialogVisible: false,
            addRightDialogVisible: false,
            roleId: '',
            rolesForm: {
                roleName: '',
                roleDesc: ''
            },
            editRolesForm: {},
            rolesFormRules: {},
            editRolesFormRules: {},
            // 树形控件绑定对象
            RightProps: {
                label: 'authName',
                children: 'children',
            },
        }

    },
    created() {
        this.getRoleList();
    },
    methods: {
        async getRoleList() {
            const {
                data: res
            } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败')
            } else {
                this.rolesList = res.data;
                // console.log(this.rolesList);
            }
        },
        // 添加新角色
        async addRoles() {
            const {
                data: res
            } = await this.$http.post('roles', this.rolesForm)
            if (res.meta.status !== 201) {
                this.$message.error('添加角色失败!')
            } else {
                this.$message.success('添加角色成功啦~');
                //    隐藏添加用户的对话框
                this.addDialogVisible = false;
                // 重新获取用户列表
                this.getRoleList();

            }
        },
        // 重置表单
        rolesReset() {
            this.$refs.rolesFormRef.resetFields();
        },
        // 修改角色
        async editRoles(id) {
            const {
                data: res
            } = await this.$http.get('roles/' + id)

            if (res.meta.status !== 200) {
                alert('获取角色信息失败')
            } else {
                this.editRolesForm = res.data
                console.log(this.editRolesForm);
            }

            this.editDialogVisible = true
        },
        editClose() {
            this.$refs.editRolesFormRef.resetFields();

        },
        editInfo() {
            this.$refs.editRolesFormRef.validate(async (valid) => {
                if (!valid) {
                    return //校验失败
                } else {
                    // 发起修改用户信息的网络请求
                    const {
                        data: res
                    } = await this.$http.put('roles/' + this.editRolesForm.roleId, {
                        roleName: this.editRolesForm.roleName,
                        roleDesc: this.editRolesForm.roleDesc
                    });
                    if (res.meta.status !== 200) {
                        this.$message.error('修改角色信息失败!')
                    } else {
                        this.$message.success('修改信息成功啦~');
                        //    隐藏添加用户的对话框
                        this.editDialogVisible = false;
                        // 重新获取用户列表
                        this.getRoleList();
                    }
                }
            })
        },
        async deleteRoles(id) {
            const confirmResult = await this.$confirm('是否删除该角色', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 当点击确定时会返回confirm
            // 当点击取消时会返回cancle字符串
            if (confirmResult !== 'confirm') {
                return this.$message.info('您已取消删除!')
            } else {
                const {
                    data: res
                } = await this.$http.delete('roles/' + id);
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败!')
                } else {
                    // this.$message.success('删除成功!')
                    this.getRoleList();
                }
            }
        },
        // 根据id删除对应权限
        async removeRight(role, id) {
            const confirmResult = await this.$confirm('是否删除该角色', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 当点击确定时会返回confirm
            // 当点击取消时会返回cancle字符串
            if (confirmResult !== 'confirm') {
                return this.$message.info('您已取消删除!')
            } else {
                const {
                    data: res
                } = await this.$http.delete(`roles/${role.id}/rights/${id}`);
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败!')
                } else {
                    // this.$message.success('删除成功!')
                    role.children = res.data
                }
            }
        },
        // 获取角色权限
        async showRight(role) {
            const {
                data: res
            } = await this.$http.get('rights/tree');
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色权限失败')
            } else {
                this.rightList = res.data;
                // console.log(this.rightList);
            }
            // 递归获取三级权限的id
            // this.defkeys = [];
            this.getThreeRight(role, this.defkeys);
            this.roleId = role.id;
            this.addRightDialogVisible = true;
        },
        // 递归获取三级选中权限
        getThreeRight(node, arr) {
            // 如果该节点没有子节点children则说明该节点是三级节点
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item =>
                this.getThreeRight(item, arr))
        },
        // 监听分配权限对话框的关闭事件
        setRightDialog() {
            this.defkeys = [];
        },
        // 为角色分配具体权限
        async applyRight() {
            // 获取分配权限的Id
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
            const strId = keys.join(',')
            const {
                data: res
            } = await this.$http.post(`roles/${this.roleId}/rights`, {
                rids: strId
            })
            if (res.meta.status !== 200) {
                return this.$message.error('分配权限失败')
            }
            this.getRoleList();
            this.addRightDialogVisible = false
        }

    }
}
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 20px;
    font-size: 15px;
}

.el-tag {
    margin: 7px;
}

.bdtoom {
    border-bottom: 1px solid #eee;
}

.bdtop {
    border-top: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>

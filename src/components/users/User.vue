<template>
<div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
            <el-col :span="7">
                <el-input placeholder="请输入内容" class="input-with-select" v-model="querInfo.query" @keydown.enter.native="addByEnterKey" clearable>
                    <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button class="add-btn" @click="dialogVisible=true">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userList" border stripe>
            <!-- 添加索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <!-- 添加按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" :circle="true" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteDialog(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 -->
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="info" icon="el-icon-s-tools" size="mini" circle @click="setRoleRight(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 页码区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加用户的对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="45%" @close="userReset">
        <!-- 内容主体区域 -->
        <el-form :model="userForm" :rules="userFormRules" ref="userFormRef" class="demo-ruleForm" label-width="100px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="userForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="userForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改按钮对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="45%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false" @close="editClose">取 消</el-button>
            <el-button type="primary" @click="editInfo">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoledialogVisible" width="45%" @close="setroleClose">
        <el-form label-width="80px" :model="userInfo">
            <el-form-item label="当前用户">
                <el-input v-model="userInfo.roleName" readonly="readonly"></el-input>
            </el-form-item>
            <el-form-item label="用户角色">
                <el-input v-model="userInfo.roleDesc"></el-input>
            </el-form-item>
            <!-- 下拉框选择角色 -->
            <el-form-item label="分配角色">
                <el-select v-model="selectId" placeholder="请选择">
                    <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRoledialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleset">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        // 验证邮箱的规则
        var checkEmail = (rule, value, cb) => {
            const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
            if (regEmail.test(value)) {
                return cb();
            } else {
                cb(new Error('请输入合法的邮箱'))
            }
        }
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
            if (regMobile.test(value)) {
                return cb();
            } else {
                cb(new Error('请输入合法的手机号'))
            }
        }
        return {

            // 获取用户列表参数对象
            querInfo: {
                query: '',
                pagenum: 1, //第几页
                pagesize: 3, //一页显示几条数据
            },
            userList: [],
            total: 0,
            // 分配角色选中时用户信息
            userInfo: {
                roleName: '',
                roleDesc: '',
                id:''
            },
            dialogVisible: false,
            setRoledialogVisible: false,
            // 可以分配的角色
            roleList: [],
            // 被选中的角色id
            selectId: '',
            userForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            userFormRules: {
                username: [{
                        required: true,
                        message: '嗨，名字忘记输入啦',
                        trigger: 'blur'
                    },
                    {
                        min: 3,
                        max: 7,
                        message: '长度要在 3 到 7 个字符内哦',
                        trigger: 'blur'
                    }

                ],
                password: [{
                        required: true,
                        message: '密码是不是忘记了？',
                        trigger: 'blur'
                    },
                    {
                        min: 6,
                        max: 15,
                        message: '密码长度不对哦~给你个提示密码在6-15位之间嘿',
                        trigger: 'blur'
                    }
                ],
                email: [{
                    required: true,
                    message: '邮箱记得填呀？',
                    trigger: 'blur'
                }, {
                    validator: checkEmail,
                    trigger: 'blur'
                }],
                mobile: [{
                    required: true,
                    message: '手机号码可以留一个嘛~',
                    trigger: 'blur'
                }, {
                    validator: checkMobile,
                    trigger: 'blur'
                }]
            },
            // 判定是否显示修改对话框
            editDialogVisible: false,
            // 查询到的数据对象
            editForm: {
                // username: '',
                // email: '',
                // mobile: ''
            },
            editFormRules: {
                email: [{
                    required: true,
                    message: '邮箱别改错了哟？',
                    trigger: 'blur'
                }, {
                    validator: checkEmail,
                    trigger: 'blur'
                }],
                mobile: [{
                    required: true,
                    message: '手机号码换成啥了？',
                    trigger: 'blur'
                }, {
                    validator: checkMobile,
                    trigger: 'blur'
                }]
            }
        }
    },
    created() {
        this.getUserList();
        // window.addEventListener("keydown", this.handleKeyDown, true); //开启监听键盘按下事件
    },
    methods: {
        async getUserList() {
            const {
                data: res
            } = await this.$http.get('users', {
                params: this.querInfo
            })

            if (res.meta.status !== 200) {
                alert('获取用户列表失败')
            } else {
                this.userList = res.data.users;
                this.total = res.data.total;
                // console.log(this.userList);
            }

        },
        addByEnterKey(e) {
            var keyCode = window.event ? e.keyCode : e.which;
            if (keyCode == 13) {
                this.getUserList();
            }
        },
        handleSizeChange(newSize) { //监听当前一页显示几条数据
            this.querInfo.pagesize = newSize;
            this.getUserList();
        },
        handleCurrentChange(newPage) { //监听当前是第几页
            this.querInfo.pagenum = newPage;
            this.getUserList();
        },
        // 监听状态的改变
        async changeState(userinfo) {
            // console.log(userinfo);
            const {
                data: res
            } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state;
                return this.$message({
                    showClose: true,
                    message: '更新用户状态失败!',
                    type: 'error',
                    duration: 1000
                });
            } else {
                return this.$message({
                    showClose: true,
                    message: '更新用户状态成功~',
                    type: 'success',
                    duration: 1000
                });
            }
        },
        // 监听对话框关闭事件
        userReset() {
            this.$refs.userFormRef.resetFields();
        },
        // 添加用户
        addUser() {
            // 表单校验
            this.$refs.userFormRef.validate(async (valid) => {
                if (!valid) {
                    return //校验失败
                } else {
                    // 发起添加用户的网络请求
                    const {
                        data: res
                    } = await this.$http.post('users', this.userForm);
                    if (res.meta.status !== 201) {
                        this.$message.error('添加用户失败!')
                    } else {
                        this.$message.success('添加用户成功啦~');
                        //    隐藏添加用户的对话框
                        this.dialogVisible = false;
                        // 重新获取用户列表
                        this.getUserList();
                    }
                }
            })
        },
        // 修改按钮点击事件
        async showEditDialog(id) {
            // console.log(id);
            const {
                data: res
            } = await this.$http.get('users/' + id)

            if (res.meta.status !== 200) {
                alert('获取用户信息失败')
            } else {
                this.editForm = res.data
                console.log(this.editForm);
            }

            this.editDialogVisible = true
        },
        editClose() {
            this.$refs.editFormRef.resetFields();
        },
        editInfo() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) {
                    return //校验失败
                } else {
                    // 发起修改用户信息的网络请求
                    const {
                        data: res
                    } = await this.$http.put('users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    });
                    if (res.meta.status !== 200) {
                        this.$message.error('修改用户信息失败!')
                    } else {
                        this.$message.success('修改信息成功啦~');
                        //    隐藏添加用户的对话框
                        this.editDialogVisible = false;
                        // 重新获取用户列表
                        this.getUserList();
                    }
                }
            })
        },
        // 删除用户事件
        async deleteDialog(id) {
            const confirmResult = await this.$confirm('是否删除该用户', '提示', {
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
                } = await this.$http.delete('users/' + id);
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败!')
                } else {
                    this.$message.success('删除成功!')
                    this.getUserList();
                }
            }
        },
        // 获取分配角色的信息
        async setRoleRight(userInfo) {
            this.userInfo.roleName = userInfo.username;
            this.userInfo.roleDesc = userInfo.role_name;
            this.userInfo.id=userInfo.id;
            // console.log(userInfo);
            // 在展示对话框之前获取所有角色列表
            const {
                data: res
            } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败!')

            }
            this.roleList = res.data;
            // console.log(this.roleList);
            this.setRoledialogVisible = true;
        },
        // 关闭分配角色对话框
        setroleClose(){
            this.selectId=''
            this.userInfo={}
        
        },
        // 提交分配角色
        async saveRoleset(){
            if(!this.selectId){
                return this.$message.error('请选择你要分配的角色!')

            }else{
              const{data:res}= await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectId})
              if(res.meta.status!=200){
                  return this.$message.error('分配角色失败~')
              }else{
                  this.getUserList();
              }
            }
            this.setRoledialogVisible=false
        }

    }
}
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 20px;
    font-size: 15px;
}

.el-pagination {
    margin-top: 15px;
}
</style>

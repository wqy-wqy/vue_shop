<template>
<div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <el-row :gutter="20">
            <el-col>
                <el-button class="add-btn" @click="addCateshowDialog">添加商品</el-button>
            </el-col>
        </el-row>
        <!-- 商品列表区域 -->
        <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
            <!-- 是否有效的模板 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
                <i class="el-icon-error" v-else style="color:lightgreen"></i>
            </template>
            <!-- 排序的模板 -->
            <template slot="order" slot-scope="scope">
                <el-tag v-if="scope.row.cat_level==0">一级</el-tag>
                <el-tag v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
            </template>
            <!-- 操作模板 -->
            <template slot="opt">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 对话框区域 -->
    <!-- 添加分类对话框 -->
    <el-dialog title="添加商品" :visible.sync="addCateDialogVisible" width="45%" @close="addCateDialogClose">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称:" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父类分级">
                <el-cascader v-model="catParentsid" :options="catParents" :props="catProps" @change="handleChange" clearable></el-cascader>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {

        return {
            // 用于分页指定查询条件
            queryInfo: {
                // 根据API文档type指定显示几级商品分类
                type: 3,
                // pagenum显示第几页
                pagenum: 1,
                // pagesize表示一页显示多少条数据
                pagesize: 5
            },
            // 商品分类数据数组
            cateList: [],
            // 总数据跳数
            total: 0,
            // 为table指定列的定义
            columns: [{
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 表示当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                }
            ],
            // 添加商品对话框显示与隐藏
            addCateDialogVisible: false,
            addCateForm: {
                cat_name: '',
                // 父级分类的id
                cat_pid: 0,
                // 分类等级默认添加的是一级分类
                cat_level: 0

            },
            // 添加表单验证的规则对象
            addCateFormRules: {
                cat_name: [{
                    required: true,
                    message: '请输入分类名称',
                    trigger: 'blur'
                }]
            },
            // 存储父级分类
            catParents: [],
            // 父级分类id
            catParentsid: [],
            // 指定配置对象
            catProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover',
                checkStrictly: true
            },

        }
    },
    created() {
        this.getCatelist();
    },
    methods: {
        // 获取商品分类数据
        async getCatelist() {
            const {
                data: res
            } = await this.$http.get('categories', {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败')
            } else {
                // console.log(res);
                // 把商品数据列表赋值给catelist
                this.cateList = res.data.result
                console.log(this.cateList);
                // 为总数据跳数赋值
                this.total = res.data.total
            }
        },
        // 监听Pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getCatelist();
        },
        // 监听pagenum的变化
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getCatelist();
        },
        // 显示添加商品对话框
        addCateshowDialog() {
            this.getParentsdata();
            this.addCateDialogVisible = true
        },
        // 获取父级分类数据列表
        async getParentsdata() {
            const {
                data: res
            } = await this.$http.get('categories', {
                params: {
                    type: 2
                }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取数据列表失败!')
            } else {
                //  console.log(res.data);
                this.catParents = res.data
            }
        },
        handleChange() {
            // console.log(this.catParentsid);
            if (this.catParentsid.length > 0) {
                this.addCateForm.cat_pid = this.catParentsid[this.catParentsid.length - 1];
                this.addCateForm.cat_level = this.catParentsid.length;
                return
            } else {
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        // 关闭添加分类窗口
        addCateDialogClose() {
            this.$refs.addCateFormRef.resetFields();
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;
            this.catParentsid = []
        },
        // 添加分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) {
                    return
                } else {
                    const {
                        data: res
                    } = await this.$http.post('categories', this.addCateForm);
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加分类失败!')
                    } else {
                        this.$message.success('添加分类成功!')
                    }
                }
            })
            this.addCateDialogVisible = false;
            this.getCatelist();
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 20px;
    font-size: 15px;
}

.el-pagination {
    margin-top: 15px;
}

.el-cascader {
    width: 100%;
}
</style>

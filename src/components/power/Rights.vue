<template>
<div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 查询权限列表 -->
        <el-table :data="rightsList" border stripe>
            <!-- 添加索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="权限名称" prop="authName"></el-table-column>
            <el-table-column label="路径" prop="path"></el-table-column>
            <el-table-column label="权限等级" prop="level">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level==0">一级</el-tag>
                    <el-tag v-else-if="scope.row.level==1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>

            </el-table-column>
        </el-table>
        <!-- 页码区域
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination> -->
    </el-card>


</div>
</template>

<script>
export default {
    data() {
        return {

            // querInfo: {
            //     query: '',
            //     pagenum: 2, //第几页
            //     pagesize: 6, //一页显示几条数据
            // },
            total: 0,
            rightsList: []

        }
    },
    created() {
        this.getRightList();
    },
    methods: {
        // 获取权限列表
        async getRightList() {
            const {
                data: res
            } = await this.$http.get('rights/list');
            //    console.log(res);
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败')
            } else {
                this.rightsList = res.data;
                this.total = res.data.length;
                // console.log(this.total);
            }
        },
        // handleSizeChange(newSize) { //监听当前一页显示几条数据
        //     this.querInfo.pagesize = newSize;
        //     this.getRightList();
        // },
        // handleCurrentChange(newPage) { //监听当前是第几页
        //     this.querInfo.pagenum = newPage;
        //     this.getRightList();
        // },
    }
}
</script>

<style lang="less" scoped>

</style>

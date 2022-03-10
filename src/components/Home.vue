<template>
<el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
        <div>

            <img class="header-img" src="../images/user.jpg" @click="imgAlt">
            <span>汉桂同心系统</span>

        </div>
        <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域-->
    <el-container>
        <!-- 页面侧边栏区域 -->
        <el-aside :width="isCollapse? '64px':'200px'">
            <div class="toggle-btn">
                <i class="el-icon-s-operation" @click="toggleCollapse"></i>
            </div>
            <!-- 整体侧边栏导航区域-->
            <el-menu :default-active="activePath" :collapse="isCollapse" :collapse-transition="false" background-color="#3f3b5a" text-color="#fff" active-text-color="#409eff" unique-opened router>
                <!-- 一级导航 -->
                <el-submenu :index="item.id +''" v-for="item in menulist" :key="item.id">
                    <template slot="title">
                        <i :class="iconObj[item.id]"></i>
                        <span>{{item.authName}}</span>
                    </template>
                    <!-- 二级导航 -->
                    <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/'+subitem.path)">
                        <template slot="title">
                            <!-- <router-link to="/home/$router"> -->
                            <i class="el-icon-menu"></i>
                            <span>{{subitem.authName}}</span>
                            <!-- </router-link> -->
                        </template>
                    </el-menu-item>
                </el-submenu>

            </el-menu>
        </el-aside>
        <!-- 页面主体区域 -->
        <el-main>
            <!-- <router-link to="/home/welcome"></router-link> -->
            <!-- 路由占位符 -->
            <router-view></router-view>
        </el-main>
    </el-container>
    <!-- 点击头像对话框区域 -->
    <el-dialog title="你滴信息" :visible.sync="dialogVisible" width="40%">
        <el-form :model="userForm" ref="userFormRef" class="demo-ruleForm" label-width="100px">
            <el-form-item label="用户名">
                <el-input v-model="userForm.username" readonly="readonly"></el-input>
            </el-form-item>
            <el-form-item label="角色">
                <el-input v-model="userForm.rolename" readonly="readonly"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="userForm.email" readonly="readonly"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
                <el-input v-model="userForm.mobile" readonly="readonly"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button @click="dialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
</el-container>
</template>

<script>
export default {
    data() {
        return {
            menulist: [],
            userForm: {
                username: '',
                rolename: '',
                email: '',
                mobile: '',
            },
            // 获取用户列表参数对象
            querInfo: {
                query: '',
                pagenum: 1, //第几页
                pagesize: 3, //一页显示几条数据
            },
            // icon图标
            iconObj: {
                '125': 'el-icon-user-solid',
                '103': 'el-icon-s-check',
                '101': 'el-icon-s-cooperation',
                '102': 'el-icon-s-order',
                '145': 'el-icon-s-data'

            },
            // 决定是否折叠侧边栏
            isCollapse: false,
            // 被激活的链接地址
            activePath: '',
            dialogVisible: false,
        }
    },
    created() {
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            window.sessionStorage.clear;
            this.$router.push('/login');
        },
        async imgAlt() {
            // this.$http.get()
            const {
                data: res
            } = await this.$http.get('users', {
                params: this.querInfo
            });
            // console.log(res);
            if (res.meta.status !== 200) {
                return this.$message({
                    showClose: true,
                    message: '获取失败!',
                    type: 'error',
                    duration: 1000
                });
            } else {
                // console.log(res.data.users[0]);
                this.userForm.username = res.data.users[0].username;
                this.userForm.rolename = res.data.users[0].role_name;
                this.userForm.email = res.data.users[0].email;
                this.userForm.mobile = res.data.users[0].mobile;

            }

            this.dialogVisible = true;
        },
        // 获取所有菜单
        async getMenuList() {
            const {
                data: res
            } = await this.$http.get('menus')
            if (res.meta.status !== 200) {
                alert('res.meta.msg')
            } else {
                this.menulist = res.data;
                console.log(this.menulist);
            }
        },
        // 实现菜单的折叠与展开
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        }
    }
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;

}

.el-main {
    background: url(../images/1.jpg);
    background-size: cover;
    height: 100%;
}

// 顶部样式
.el-header {
    background-color: rgb(63, 59, 90);
    display: flex;
    // 左右贴边对齐
    justify-content: space-between;
    // 左右侧空白是因为padding
    padding-left: 10px;
    // 右侧按钮居中
    align-items: center;
    font-size: 30px;
    color: white;
    font-family: 'Times New Roman', Times, serif;

    // 嵌套less语法 让文本也居中对齐，类比上述按钮居中对齐方式
    >div {
        display: flex;
        align-items: center;

        span {
            margin-left: 30px;
        }
    }
}

.el-button {
    background-color: rgb(179, 173, 221);
    font-size: 16px;
    font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
}

.header-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
}

// 左侧样式
.el-aside {
    background-color: #3f3b5a;

    .el-menu {
        font-size: 17px;
        border-right: 0;
    }
}

.toggle-btn {
    background-color: #625a94;
    font-size: 25px;
    color: #fff;
    text-align: center;
    cursor: pointer;
}


</style>

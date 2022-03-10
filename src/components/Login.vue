<template>
<div class="login_conatiner">
    <div class="login_box">

        <!-- 头部welcome区域 -->
        <label class="label_box">汉桂同心</label>

        <!-- 登录注册部分 -->

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_main">
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="你的名字" prefix-icon="el-icon-user-solid"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" placeholder="还记得密码嘛~嘿嘿" prefix-icon="el-icon-key" type="password"></el-input>
            </el-form-item>
            <!-- 按钮部分 -->
            <el-form-item class="btns">
                <el-button class="btn_login" @click="login">登录</el-button>
                <el-button class="btn_preset" @click="resetLoginForm">重置</el-button>
            </el-form-item>
        </el-form>
    </div>

</div>
</template>

<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: '',
                password: ''
            },
            // 这是表单的验证规则对象
            loginFormRules: {
                // 验证用户名是否合法
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
                //验证密码是否合法
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
                ]
            }
        };
    },
    methods: {
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return;
                // 因为我们只需要返回的data数据对象，所以可以这样获取
                // const result=await this.$http.post('login',this.loginForm);
                // console.log(result);
                const {
                    data: res
                } = await this.$http.post('login', this.loginForm);
                // console.log(res);
                if (res.meta.status != 200)
                    return this.$message({
                        showClose: true,
                        message: '登录失败咯~',
                        type: 'error',
                        duration:1000
                    });
                else {
                    // this.$message({
                    //     showClose: true,
                    //     message: '恭喜你!登录成功啦!',
                    //     type: 'success',
                    //     duration:1000
                    // });
                    // 将token保存到session Storage中
                    window.sessionStorage.setItem("token", res.data.token);
                    // 路由跳转
                    this.$router.push("/home")
                }
            })
        }
    }
};
</script>

<style lang="less" scoped>
/* // scoped表示样式只在自己组件生效 */
.login_conatiner {
    background: url(../images/8.jpg) no-repeat;
    background-size: cover;
    height: 100%;
}

.login_box {
    width: 500px;
    height: 300px;
    background-color: rgb(228, 201, 235);
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 12px 15px 10px 0px black;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 15px;
    z-index: 1;
}

// welcome样式
.label_box {
    width: 500px;
    height: 50px;
    background-image: -webkit-linear-gradient(left, rgb(44, 44, 187), #358686 10%, #cc00ff 20%, #CC00CC 30%, #4e4ea0 40%, #5ab6b6 50%, #5c5ca0 60%, #CC00CC 70%, #CC00FF 80%, #47a0a0 90%, blue 100%);
    -webkit-text-fill-color: transparent;
    /* 将字体设置成透明色 */
    -webkit-background-clip: text;
    /* 裁剪背景图，使文字作为裁剪区域向外裁剪 */
    -webkit-background-size: 100% 100%;
    -webkit-animation: masked-animation 4s linear infinite;
    font-size: 90px;
    font-weight: bold;
    font-family: 'Times New Roman';
    font-style: oblique;

}

.login_main {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 70px;
    box-sizing: border-box;
    opacity: 0.8;
}

.btns {
    display: flex;
    justify-content: flex-end;
}

// 登录按钮样式
.btn_login {
    background-color: #5197cf;
    border: #254966;
}

// 重置按钮样式
.btn_preset {
    background-color: #ec98c6;
    border: #ec98c6;
}

.btn_login:active {
    background-color: #5197cf;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}

.btn_preset:active {
    background-color: #ec98c6;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}
</style>

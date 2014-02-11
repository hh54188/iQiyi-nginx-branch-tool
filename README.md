# iQiyi-nginx-branch-tool

感谢[杨寒星同学](https://github.com/nighca)的大力支持！

## 目录

- [Window下使用教程](#window%E4%B8%8B%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B)
- [Uuntu下使用教程](#ubuntu%E4%B8%8B%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B)
- [技术细节](#%E6%8A%80%E6%9C%AF%E7%BB%86%E8%8A%82)

## Window下使用教程

### 1. 安装nginx

前往[官方下载页面](http://nginx.org/en/download.html)，下载stable version压缩包:

![stable version](./intro/001.png)

解压至任意目录(推荐`C:\nginx-1.5.8`)

### 2. 启动nginx

**注意，若有运行WampServer, 请先退出WampServer，因为WampServer和nginx运行时都占用80端口**

使用命令行工具(推荐[git bash](https://code.google.com/p/msysgit/downloads/list))切换至nginx目录后，
执行：`start nginx`，如:

```
cd c:/
cd nginx-1.5.10
start nginx
```

若启动成功，能够在任务管理器中找到nginx进程：

![start nginx](./intro/002.png)

若启动失败，可以在`nginx-/logs/error.log`日志文件中查看失败原因

另附上其他命令：

```
nginx -s stop   fast shutdown
nginx -s quit   graceful shutdown
nginx -s reload  changing configuration, starting new worker processes with a new configuration, graceful shutdown of old worker processes
nginx -s reopen re-opening log files
```
更多细节请参考：http://nginx.org/en/docs/windows.html

### 3. 安装工具

1. 使用git clone命令(git@github.com:hh54188/iQiyi-nginx-branch-tool.git)或者直接下载[工具压缩包](https://github.com/hh54188/iQiyi-nginx-branch-tool/archive/master.zip)，下载工具

2. **工具必须解压至nginx根目录！**

3. 运行`npm install`安装`express`

### 4. 分支目录结构(与原结构大致相同)：

```
E: 
|--Work
    |--qiyi
         |--js
         |   |--lib
         |   |    |--sea1.2.js
         |   |--pingback
         |       |--iwt.js
         |       |--qa.js
         |--trunk
         |   |--js
         |       |--qiyiV2
         |--branch_1
         |   |--js
         |       |--qiyiV2         
         |--branch_2
         |   |--js
         |       |--qiyiV2         
         |--branch_3
             |--js
                 |--qiyiV2         
```

**注意**，`lib/sea1.2.js`与`pingback/iwt.js`与`pingback/qa.js`必须存在在本地，与WampServer不同，如果本地不存在它不会去线上获取！为什么不做成从线上获取？因为我不会……

### 5. 运行分支工具

1. 运行前请修改`app.js`文件，以确保目录结构和nginx配置文件与本地一致：

```
WIN: {
        WORK_DIR: "E:\\Work\\qiyi",
        NGINX_CFG_URL: "C:\\nginx-1.5.8\\conf\\nginx.conf",
```

2. 运行 `node app.js`

3. 在浏览器中打开 http://127.0.0.1:8000

### 6. 创建分支

**注意**，使用该功能前请确认命令行工具能够使用svn命令。若无法运行该命令，重装TortoiseSVN时勾选相应选项即可（默认不安装）。

1. 填入分支文件夹名称（支持中文）与分支svn地址

2. 点击创建

## Ubuntu下使用教程

### 1. 安装nginx

```
sudo -s
nginx=stable    # use nginx=development for latest development version
add-apt-repository ppa:nginx/$nginx
apt-get update 
apt-get install nginx
```
请参考 http://wiki.nginx.org/Install#Ubuntu_PPA

### 2. 运行nginx

执行命令 `sudo service nginx start`

### 3. 安装工具

与Windows下相同，但无需解压至nginx目录，解压至任意目录即可

### 4. 分支目录结构

与Windows下基本一致， 不过Work目录改为home目录下，如`/home/liguangyi/Work/`

### 5. 运行分支工具

`app.js`中这三处需要根据实际情况修改

```
var user = "liguangyi"; // 当前用户
var uid = 1000; // 在终端中执行id命令，查看uid与gid
var gid = 1000;
```

`sudo node app.js` **请务必使用sudo命令运行**

### 6. 创建分支

**请确认已安装svn命令行工具**

若无安装，使用`apt-get`命令安装即可

## 技术细节

### 实现原理

通过更改nginx的配置文件，

Windows下为`nginx-1.5.8/conf/nginx.conf`

```
server {
    listen       80;
    
    location /js/qiyiV2/ {
        #qiyiV2
        root   E://Work/qiyi/master;
    }

    location /js/lib/ {
        #lib
        root   E://Work/qiyi/;
    }

    location /js/pingback/ {
        #pingback
        root   E://Work/qiyi/;
    }
```

ubuntu下为`/etc/nginx/sites-available/default`

```
location /js/qiyiV2/ {
    #qiyiV2
    root   /home/liguangyi/Work/master;
}

location /js/lib/ {
    #lib
    root   /home/liguangyi/Work;
}

location /js/pingback/ {
    #pingback
    root   /home/liguangyi/Work;
}
```

每一次更改配置文件都需要重启nginx

### 执行命令行

通过

```
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
```

这两个模块执行命令行

其中spwan能够制定执行命令行的用户组别
















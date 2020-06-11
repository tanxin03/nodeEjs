const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParse = require('cookie-parser')
const moment = require('moment')
const multer = require('multer')
// 创建ejs模块
const ejs = require('ejs')
app.use(express.static('public'));
app.use(express.static('upload'));
// 创建ejs模板引擎
app.set('view engine', 'ejs')
const {find, insert, update, deleteOne } = require('./db/db')
const session = require('express-session')

// post请求方式访问需要用的中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


//配置session中间件
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: ('name', 'value',{maxAge:  5*60*1000, secure: false})
}));
// 刷新 session 时间
app.use(function(req, res, next){
  	req.session._garbage = Date();
  	req.session.touch();
  	next();
});

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./upload')
    },
    filename:function(req,file,cb){
        //cb(null, file.fieldname+'-'+Date.now()+'.'+fileFormat[fileFormat.length-1])
        let ext = file.originalname.split(".")[1]
        let fname = file.originalname.split(".")[0]
        let date = new Date().getTime()
        cb(null,`${fname}${date}.${ext}`)
    }
})
var upload = multer({
    storage:storage
})


// express  req.session.account = 'tanxin';
app.get("/", function(req, res){
	if(!req.session.account){
		res.redirect('/login')
	}else{
		if(req.query&&req.query.name){
			var params = {
				isShow:1,
				name: new RegExp(`${req.query.name}`) 
			}
		}else{
			var params = {
				isShow:1
			}
		}
		find('products', params, function(err,result){
			if(err){
				res.send("<script>alert('数据库连接失败');l</script>");
				return
			}
			res.render('index',{
				products: result,
				userinfo: req.session.account
			})
		})
		
	}
})
app.get("/login", function(req, res){
	res.render('login')
})

app.get("/add", function(req, res){
	if(!req.session.account){
		res.redirect('/login')
	}else{
		res.render('add')
	}
})

app.post("/doLogin", function(req, res){
	let { name, password } = req.body
	find('user', { name, password }, function(err, result){
		if(err){
			res.send("<script>alert('数据库连接失败');location.href='/login'</script>");
		}
		if(result.length>0){
            //保存用户信息
            req.session.account=result[0].name;
            res.redirect('/');  /*登录成功跳转到商品列表*/
        }else{
            res.send("<script>alert('登录失败');location.href='/login'</script>");
        }

	})
})
app.post("/addShop", upload.single('image'), function(req, res){
	let params = {
		createTime:  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
		creator: req.session.account,
		isShow:1,
		image:req.file.filename
	}
	Object.assign(params, req.body)
	insert("products", params, function(err, result){
		if(err){
			res.send("<script>alert('服务器错误');</script>");
			return
		}
		res.send("<script>alert('添加成功');window.location.href='/'</script>");
	})
})
app.get("/doDelete", function(req,res){
	let { name } = req.query
	console.log(name)
	update('products',{name},{isShow:0},function(err,result){
		if(err){
			res.send({
				msg:"数据库连接失败",
				code:400,
				data:null
			});
			return
		}
		res.send({
			msg:"删除成功",
			code:200,
			data:null
		});
	})
})
app.post("/editShop", upload.single('image'), function(req, res){
	if(req.file&&req.file.filename){
		var params = {
			image: req.file.filename,
			number: req.body.number,
			creator: req.session.account,
			updateTime:  moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
		}
	}else{
		var params = {
			number: req.body.number,
			creator: req.session.account,
			updateTime:  moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
		}
	}
	update('products', {name:req.body.name}, params, function(err,result){
		if(err){
			res.send("<script>alert('数据库错误，请重试');window.location.reload()</script>");
			return
		}
		res.send("<script>alert('修改成功');window.location.href='/'</script>");
		return
	})
})
app.get("/edit", function(req, res){
	let params = {
		isShow:1,
		name:req.query.name
	}
	find('products', params, function(err,result){
		console.log("234")
		if(err){
			res.send("<script>alert('数据库错误，请重试');window.location.reload()</script>");
			return
		}
		if(result.length>0){
			let data = result[0]
			res.render("edit",{
				data
			})
		}else{
			res.send("<script>alert('未查到内容');window.location.reload()</script>");
		}
	})
})
app.get("/logout",function(req,res){
  	req.session.destroy();
  	res.send("<script>alert('注销成功');window.location.href='/login'</script>");
  	// res.redirect("/"); //删除成功后转到百度页面
})
app.listen(3000, function(){
	console.log("listen start port 3000")
})

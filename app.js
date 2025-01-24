var express = require("express");
var path = require("path");
var app = express();
var methodOverride = require('method-override');
const main = require("./connect.js");
const BlogModel = require('./models/blog.js');
const UserModel = require('./models/user.js');
const data = require('./data.js');
var cookieParser = require('cookie-parser');
var {setUser , getUser} = require("./service/auth.js");
var {checkAuthentication} = require("./middlewares/auth.js");
const multer  = require('multer');



app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(cookieParser());

let URL ='mongodb://127.0.0.1:27017/blogs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, './public/photos');
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}-${file.originalname}`);
    }
});
  
const upload = multer({ storage: storage });


main(URL)
.then(()=>{
    console.log("connected successfully")
})
.catch(err => console.log(err));

app.get("/",async (req,res)=>{
    let blogs = await BlogModel.find({}).sort({ publishDate: -1 });
    
    res.render("home.ejs" , {blogs , name: ""});
    
});

    
app.get("/user",checkAuthentication,async (req,res)=>{
    let user =req.user;
    let blogs = await BlogModel.find({}).sort({ publishDate: -1 });
    let name = user.user.fullname;
    if(user.user.roles == "ADMIN"){
        res.render("admin.ejs"  , {blogs , name});
    }else{

        res.render("home.ejs" , {blogs , name});
        
    }
    
});

app.get("/user/blogs",async (req,res)=>{  
    let blogs = await BlogModel.find({}).sort({ publishDate: -1 });
    res.render("adminBlogs.ejs" , {blogs})
    
});

app.get("/user/:id/edit",async (req,res)=>{
    let title = req.params.id;
    let blog = await BlogModel.findOne({title: title});
    res.render("edit.ejs", {blog});
    
});
app.put("/user/:id/edit",upload.single("Image"),async (req,res)=>{
    let name = req.params.id;
    let {title, category, description} = req.body;
  
    if(req.file){
        let filepath = "/photos/" + req.file.filename ;      
        let blog = await BlogModel.findOneAndUpdate({title: name},{title:title ,category:category ,description:description , imgUrl:filepath} , {runValidators : true});
    }
    else{      
        let blog = await BlogModel.findOneAndUpdate({title: name},{title:title ,category:category ,description:description } , {runValidators : true});
    }
    res.redirect("/user/blogs");
    
});

app.get("/user/:id/delete",async (req,res)=>{
    let title = req.params.id;
    let blog = await BlogModel.findOne({title: title});   
    res.render("delete.ejs", {blog});
    
});

app.delete("/user/:id/delete",async (req,res)=>{
    let title = req.params.id;
    let blog = await BlogModel.findOneAndDelete({title: title});   
    res.redirect("/user/blogs");
});

app.get("/user/blogs/new",async (req,res)=>{
    res.render("new.ejs");
});

app.post("/user/blogs/new",upload.single("Image"),async (req,res)=>{
    let {title, category, description } = req.body;
    let filepath = "/photos/" + req.file.filename ;
    let publishDate =  Date.now();
    let blog = await BlogModel.create({title:title ,category:category ,description:description , imgUrl:filepath ,publishDate:publishDate});
    res.redirect("/user");
    
});

app.get("/user/categories",async (req,res)=>{  
    let blogs = await BlogModel.find({}).sort({ publishDate: -1 });   
    res.render("category.ejs",{blogs});  
});

app.get("/user/:id/categories/edit",async (req,res)=>{
    let category = req.params.id;
    let blog = await BlogModel.findOne({category: category});  
    res.render("categoryEdit.ejs", {blog});    
});

app.post("/user/:id/categories/edit",async (req,res)=>{
    res.redirect("/user/categories");
});

app.get("/user/:id/categories/delete",async (req,res)=>{
    let category = req.params.id;
    let blog = await BlogModel.findOne({category: category});
    res.render("categoryDelete.ejs", {blog});
    
});

app.post("/user/:id/categories/delete",async (req,res)=>{
    res.redirect("/user/categories");   
});

app.get("/user/categories/new",async (req,res)=>{  
    res.render("newCategory.ejs");  
});

app.post("/user/categories/new",async (req,res)=>{ 
    res.redirect("/user");  
});

app.get("/logout",async (req,res)=>{
    res.clearCookie("token");   
    res.redirect("/"); 
});


app.get("/signup",async (req,res)=>{
    res.render("signup.ejs");  
});
app.post("/signup",async (req,res)=>{
    let {fullname , email, password} = req.body;
    try{
        let user = await UserModel.create({fullname:fullname, email:email,password:password,roles :"NORMAL"});
    }catch(err){
        console.log("err", err);
    }
    res.redirect("/");   
});
app.get("/signin",async (req,res)=>{    
    res.render("signin.ejs");    
});

app.post("/signin",async (req,res)=>{   
    let { email, password} = req.body;
    let user = await UserModel.findOne({email,password});
    if(!user){
        res.render("signin.ejs");
    }
    else{
        let token = setUser(user);
        res.cookie("token",token);
        res.redirect("/user")
    } 
});

app.get("/:title", async (req, res) => {
    let title = req.params.title;
    
    try {
        let blog = await BlogModel.findOne({ title: title });
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        res.render("details.ejs", { blog });
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).send("Internal Server Error");
    }
});
    

app.listen(5000,()=>{
    console.log("server is ready...");
});
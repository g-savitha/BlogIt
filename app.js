var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    port = process.env.PORT || 3000;
//APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
//fake a PUT request using method-override
app.use(methodOverride("_method")); //look for _method key in URL and take its value
app.use(expressSanitizer());
//MONGOOSE/MODEL CONFIG
//Schema
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    //we can write created : Date, but we need to manually enter date in that case. Now if you specify it as {type : Date, default : Date.now} it will pick today's date automatically
    created: {
        type: Date,
        default: Date.now
    }
})
//model name should always be Singular, coz mongoose adds an S at the end of the Collection Name
var Blog = mongoose.model('Blog', blogSchema);

//RESTFUL ROUTES
app.get('/', (req, res) => {
    res.redirect('/blogs');
});
//INDEX route
app.get('/blogs', (req, res) => {
    //fetch data from DB and display
    Blog.find({}, (err, blogs) => {
        if (err)
            console.log('error');
        else {
            res.render('index', {
                blogs: blogs
            });
        }
    })
})
//NEW route
app.get('/blogs/new', (req, res) => {
    res.render('new');
})
//CREATE route
//sanitize input where we have data entry to db
app.post('/blogs', (req, res) => {
    //sanitize  data
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //instead of creating a new object with title, image etc fields, directly put the blog object. because by using blog[title], blog[image] in new.ejs we have added title and image fields to blog object
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err)
            res.render("new");
        else
            res.redirect('/blogs');
    })

})

//SHOW route
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err)
            res.redirect('/blogs');
        else
            res.render("show", {
                blog: foundBlog
            })
    })
})

//EDIT route - this is a combo of new and show routes
//we need to edit an existing data

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err)
            res.redirect('/blogs');
        else {
            res.render("edit", {
                blog: foundBlog
            })
        }
    })

})
//UPDATE route
//the data will be updated in URL, but not the blog post. Because html doesnt support PUT requests, it supports only GET and POSt
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findOneAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})
//DESTROY ROUTE
app.delete('/blogs/:id', (req, res) => {
    //destroy blog
    //redirect somewhere
    Blog.findOneAndRemove(req.params.id, (err) => {
        if (err)
            res.redirect('/blogs')
        else
            res.redirect('/blogs')
    })

})
app.listen(port, () => {
    console.log("Blog App is listening on port: " + port);
})
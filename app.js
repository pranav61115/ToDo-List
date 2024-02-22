//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-pranav:test123@cluster0.vv9h8qf.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "item",
  itemsSchema
);

const item1 = new Item({
  name: "Welcome to your ToDo list"
});

const item2 = new Item({
  name: "press + to create a new item"
});

const item3 = new Item({
  name: "<-- press this to delete an existing item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model(
  "List",
  listSchema
)



app.get("/", function(req, res) {

  Item.find().then((items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("success");
      }).catch(function(err) {
        console.log(err);
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === 'Today'){
      newItem.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    }).catch((err)=>{
      console.log(err);
    })
  }



});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listN = req.body.listN;

if(listN === "Today"){
  console.log(itemId);
  Item.findByIdAndDelete(itemId).then((data) => {
    console.log(data);
  }).catch(function(err) {
    console.log(err);
  });
  res.redirect("/");
}else{
  List.findOneAndUpdate({name:listN},
    {$pull: {items: {_id: itemId}}}).then((data)=>{
              res.redirect("/" + listN);
    }).catch((err)=>{
      console.log(err);
    })
};
});



app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;



  List.findOne({
    name: customListName
  }).then((data) => {

    if (data) {
      // show existing list
      res.render("list", {
        listTitle: data.name,
        newListItems: data.items
      })
    } else {
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
        list.save();
      res.redirect("/"+customListName);
    }
  }).catch((err) => {
    console.log(err);
  });



})



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

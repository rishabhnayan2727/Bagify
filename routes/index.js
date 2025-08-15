const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel=require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error, loggedin:false });
});

router.get("/shop", isloggedin,async function (req, res) {
    let products=await productModel.find();
    let success=req.flash("success");
    res.render("shop",{products, success});
});

router.get("/cart", isloggedin, async function (req, res) {
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    let bills = user.cart.map(item => {
        return (Number(item.price) + 20) - Number(item.discount);
    });
    res.render("cart", { user, bills });
});


router.get("/addtocart/:id", isloggedin, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.id);
    await user.save();
    req.flash("success", "Added to cart");
    res.redirect("/shop");
});

// Update quantity
router.post("/cart/update-quantity/:index", isloggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let index = parseInt(req.params.index);
    user.cart[index].quantity = req.body.quantity;
    await user.save();
    res.json({ success: true });
});

// Remove item
router.delete("/cart/remove/:index", isloggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let index = parseInt(req.params.index);
    user.cart.splice(index, 1);
    await user.save();
    res.json({ empty: user.cart.length === 0 });
});


router.get("/logout", isloggedin, function (req, res) {
    res.render("/");
});

module.exports = router;

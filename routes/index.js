const isAuthenticated = require("./authMiddleware").isAuthenticated;
const express = require('express');
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Require controller modules.
const goal_controller = require('../controllers/goalsController');
const User = require('../models/users');
const Goal = require('../models/goals');

/* GET home page. */
router.get("/", (req, res) => {
    res.render("index", { user: req.user });
});


  
/* GET goal detail page. */
router.get('/goals/:id', goal_controller.goal_detail);

/* GET create goal page. */
router.get("/create", goal_controller.goal_create_get);

/* POST create goal page. */
router.post("/create", goal_controller.create_goal);

// POST request to delete Post.
router.post("/goals/:id/delete", goal_controller.delete_goal);

// POST request to update Post.
router.post("/goals/:id/update", goal_controller.update_goal);



// user goals page
router.get('/user-goals', isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user._id; // change the userId to use the ObjectId format
      const goals = await Goal.find({ userId });
      res.render('goals', { 
        title: 'My Goals',
        goals
      });
    } catch (err) {
      next(err);
    }
  });
  

// Logout route
// Add new route for logout
router.get('/logout', function(req, res){
  req.logout(function(err) {
    if(err) return next(err);
    res.redirect('/');
  });
});

  
// log in page
router.post("/log-in", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

// sign up page
router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", async (req, res, next) => {
    try {
        bcrypt.hash(req.body.password, 10, async function(err, hash) {
            if (err) {
                return next(err);
            }
            
            // Store hash in your password DB.
            const user = new User({
                username: req.body.username,
                password: hash
            });

            const result = await user.save();
            res.redirect("/");
        }); 
    } catch(err) {
        return next(err);
    };
});
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return next();
    }
    const goals = await Goal.find();
    res.render("goals", {
      title: `${user.username}'s Goals`,
      user,
      goals,
    });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
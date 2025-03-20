const express = require('express');
const router = express.Router();
const CoffeeShop = require('../models/coffeeShop');

// GET coffee shops (all or filtered by user)
router.get('/', async (req, res) => {
  try {
    let coffeeShops;
    
    if (req.query.filter === 'user' && req.session.user) {
      // Show only coffee shops added by the signed-in user
      coffeeShops = await CoffeeShop.find({ addedBy: req.session.user._id });
    } else {
      // Show all coffee shops
      coffeeShops = await CoffeeShop.find();
    }

    res.render('coffeeShops/index.ejs', {
      coffeeShops: coffeeShops,
      user: req.session.user,
      filter: req.query.filter || 'all'
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
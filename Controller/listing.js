const Listing = require('../models/listing.js');
module.exports.index = async (req,res)=>{
    const allListing = await Listing.find({});
    res.render("listing/index.ejs",{allListing});
   
 };

module.exports.newForm = (req, res) => {
    console.log("Reached the new listing page");
    res.render("listing/new.ejs");
};

module.exports.create = async (req, res, next) => {
    // if (!req.body.listing) throw new ExpressError("Invalid Listing Data", 400);  
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url,"..",filename);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };   
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listing");
        
};


module.exports.show = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
       path : "reviews",
       populate : {
           path : "author"
       },  

    })
    .populate("owner");
    if(!listing){
       req.flash("error","Listing you requested does not exist");
       res.redirect("/listing");
    }
    res.render("listing/show.ejs",{listing});
};

module.exports.edit = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
       req.flash("error","Listing you requested does not exist");
       res.redirect("/listing");
    }
   res.render("listing/edit.ejs",{listing});
};

module.exports.update =async (req,res)=>{
     let {id} = req.params;
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

        if(req.file){        
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }
     req.flash("success", "Edited a Listing!");
     res.redirect(`/listing/${id}`);
 };

module.exports.destroy = async (req,res)=>{
    let {id} = req.params;
    const list = await Listing.findByIdAndDelete(id);
    console.log(list);
    res.redirect("/listing");
 };

 module.exports.privacy = (req,res)=>{
    res.render("listing/privacy.ejs");
 };

 module.exports.terms = (req,res)=>{
    res.render("listing/Terms.ejs");            
    };
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
    title:{
        type:String,
        required : true,
    },
    description:String,
    image: {
        url: String,
        filename: String ,
        
    },
    
    price: { type: Number, required: true, default: 0 },
    location:String,
    country:String,
    reviews:[
        {
            type : Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner :{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});

listingSchema.post("findOneAndDelete",async function (doc){
    if(doc){
        await Review.deleteMany({_id : {$in : doc.reviews} });
    }
        
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;

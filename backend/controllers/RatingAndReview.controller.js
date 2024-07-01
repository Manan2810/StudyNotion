const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")

// create Rating
exports.createRating = async (req,res) => {
    // get userid 
    const userId = req.user.id;
    // data fetch
    const {rating,review, courseId} = req.body;
    // check if user enrolled or not
    const courseDetails = await Course.findOne(
        {
            _id:courseId,
            studentsEnrolled:{$eleMatch:{$eq:userId}},
        }
    )
    // check if user already reviewed the course
    // create rating
    // update the course with the rating review
    // return response
}
// getAverageRating
// getAllRating
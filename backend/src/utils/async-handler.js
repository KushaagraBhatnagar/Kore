const asyncHandler = (requestHandlerfn) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandlerfn(req,res,next))
            .catch((err) => next(err))
    }
}
export default asyncHandler
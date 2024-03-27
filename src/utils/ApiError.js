
class ApiError extends Error{
    constructor(
     statuscode,
     messege="somthing went wromng",
     errors=[],
     stack=""
    )
    {
       super(messege)
       this.statuscode=statuscode;
       this.message=messege;
       this.errors=errors;
       this.data=null;
       this.success=false;

       if(stack){
        this.stack=stack;
       }else{
        Error.captureStackTrace(this,this.constructor)
       }

    }
}
export {ApiError}
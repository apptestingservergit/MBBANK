const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const mongoURI =
"mongodb://lek08670_db_user:FAO3ldqdKZMAMob5@ac-cgnebag-shard-00-00.yyenbmv.mongodb.net:27017,ac-cgnebag-shard-00-01.yyenbmv.mongodb.net:27017,ac-cgnebag-shard-00-02.yyenbmv.mongodb.net:27017/quan_ly_vay?ssl=true&replicaSet=atlas-qeivq6-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(mongoURI)
.then(()=>{

    console.log("================================");

    console.log("MongoDB Connected");

    console.log("================================");

})
.catch(err=>{

    console.log(err);

});

//////////////////////////////////////////////////////

const LoanSchema = new mongoose.Schema({

    name:String,

    amount:Number,

    paid:Number,

    isOverdue:Boolean,
    
    note: String // Thêm trường ghi chú

});

const Loan = mongoose.model("Loan",LoanSchema);

//////////////////////////////////////////////////////

const TransactionSchema = new mongoose.Schema({

    amount:Number,

    date:String,

    description:String

});

const Transaction = mongoose.model("Transaction",TransactionSchema);

//////////////////////////////////////////////////////
// SETTINGS (Cấu hình thông tin chuyển khoản)
//////////////////////////////////////////////////////

const SettingsSchema = new mongoose.Schema({
    staffName: String,
    accountNumber: String
});

const Settings = mongoose.model("Settings", SettingsSchema);

app.get("/api/settings", async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = { staffName: "Vui lòng chờ", accountNumber: "Vui lòng chờ" };
    }
    res.json(settings);
});

app.post("/api/settings", async (req, res) => {
    let settings = await Settings.findOne();
    if (settings) {
        settings.staffName = req.body.staffName;
        settings.accountNumber = req.body.accountNumber;
        await settings.save();
    } else {
        settings = new Settings(req.body);
        await settings.save();
    }
    res.json({ success: true });
});

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

app.post("/api/login",(req,res)=>{

    const {username,password}=req.body;

    if(username==="admin" && password==="admin"){

        return res.json({

            success:true,

            role:"admin"

        });

    }

    if(username==="Bao" && password==="1"){

        return res.json({

            success:true,

            role:"user"

        });

    }

    res.json({

        success:false,

        message:"Sai tài khoản hoặc mật khẩu"

    });

});

//////////////////////////////////////////////////////
// LOAN
//////////////////////////////////////////////////////

app.get("/api/loans",async(req,res)=>{

    const data=await Loan.find();

    res.json(data);

});

app.post("/api/loans",async(req,res)=>{

    const loan=new Loan(req.body);

    await loan.save();

    res.json({

        success:true

    });

});

app.put("/api/loans/:id",async(req,res)=>{

    await Loan.findByIdAndUpdate(

        req.params.id,

        req.body

    );

    res.json({

        success:true

    });

});

app.delete("/api/loans/:id",async(req,res)=>{

    await Loan.findByIdAndDelete(

        req.params.id

    );

    res.json({

        success:true

    });

});

//////////////////////////////////////////////////////
// TRANSACTION
//////////////////////////////////////////////////////

app.get("/api/transactions",async(req,res)=>{

    const data=await Transaction.find();

    res.json(data);

});

app.post("/api/transactions",async(req,res)=>{

    const tran=new Transaction(req.body);

    await tran.save();

    res.json({

        success:true

    });

});

app.delete("/api/transactions/:id",async(req,res)=>{

    await Transaction.findByIdAndDelete(

        req.params.id

    );

    res.json({

        success:true

    });

});

//////////////////////////////////////////////////////
// PAGE
//////////////////////////////////////////////////////

app.get("/",(req,res)=>{
    res.sendFile(
        path.join(__dirname,"public","login.html")
    );
});

app.get("/login",(req,res)=>{
    res.sendFile(
        path.join(__dirname,"public","login.html")
    );
});

app.get("/admin",(req,res)=>{

    res.sendFile(

        path.join(__dirname,"public","admin.html")

    );

});

app.get("/user",(req,res)=>{

    res.sendFile(

        path.join(__dirname,"public","user.html")

    );

});

app.get("/transfer", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "transfer.html")
    );
});

//////////////////////////////////////////////////////

app.listen(PORT,()=>{

    console.log("");

    console.log("================================");

    console.log("Server Running");

    console.log("http://localhost:"+PORT);

    console.log("================================");

});
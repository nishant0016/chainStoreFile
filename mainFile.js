let express =require("express");
let app = express();
app.use(express.json());
app.use(function (req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With,Content-Type,Accept"
    );
    next();
})
var port=process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));
let fs=require("fs");
let readline=require("readline-sync");
let fshops="shopsData.json";
let fproducts="productsData.json";
let fpurchases="purchases.json";

let {shopsData,productsData,purchasesData}=require("./data.js");

app.get("/resetShopsData",function(req,res){
    let str=JSON.stringify(shopsData);
    fs.writeFile(fshops,str,function(err){
        if(err) res.status(404).send(err);
        else{
            res.send("Shops Data in file is reset");
        }
    })
})
app.get("/resetProductsData",function(req,res){
    let str=JSON.stringify(productsData);
    fs.writeFile(fproducts,str,function(err){
        if(err) res.status(404).send(err);
        else{
            res.send("Products Data in file is reset");
        }
    })
})

app.get("/resetPurchasesData",function(req,res){
    let str=JSON.stringify(purchasesData);
    fs.writeFile(fpurchases,str,function(err){
        if(err) res.status(404).send(err);
        else{
            res.send("Purchases Data in file is reset");
        }
    })
})

app.get("/shops",function(req,res){
    fs.readFile(fshops,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            res.send(obj);
        }
    })
})

app.post("/shops",function(req,res){
    let body=req.body;
    fs.readFile(fshops,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            let maxId=obj.reduce((acc,curr)=>curr.shopId>=acc?curr.shopId:acc,0);
            let newId=maxId+1;
            let newShops={shopId:newId,...body};
            obj.push(newShops);
            let data1=JSON.stringify(obj);
            fs.writeFile(fshops,data1,function(err){
                if(err) res.status(404).send(err);
                else res.send(newShops);
            })
        }
    })
})

app.get("/products",function(req,res){
    fs.readFile(fproducts,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            res.send(obj);
        }
    })
});

app.get("/products/:id",function(req,res){
    let id=+req.params.id;
    fs.readFile(fproducts,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            let product=obj.find(pr=>pr.productId === id)
            res.send(product);
        }
    })
});

app.post("/products",function(req,res){
    let body=req.body;
    fs.readFile(fproducts,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            let maxId=obj.reduce((acc,curr)=>curr.productId>=acc?curr.productId:acc,0);
            let newId=maxId+1;
            let newProducts={productId:newId,...body};
            obj.push(newProducts);
            let data1=JSON.stringify(obj);
            fs.writeFile(fproducts,data1,function(err){
                if(err) res.status(404).send(err);
                else res.send(newProducts);
            })
        }
    })
})


app.put("/products/:id",function(req,res){
    let id=+req.params.id;
    let body=req.body;
    fs.readFile(fproducts,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            let index = obj.findIndex((st) => st.productId === id);
            if (index >= 0){
                let updatedproduct={...body};
                obj[index]=updatedproduct;
                let data1 = JSON.stringify(obj);
                fs.writeFile(fproducts, data1, function (err) {
                  if (err) res.status(404).send(err);
                  else res.send(updatedproduct);
                });
            }
            else{
                res.status(404).send("No product Found")
            }
        }
    })
})
app.get("/purchases", function (req, res) {
    const shop = +req.query.shop;
    let product = req.query.product;
    const sort = req.query.sort;

    fs.readFile(fpurchases, "utf8", function (err, data) {
        if (err) {
            return res.status(500).send("Error reading data.");
        }

        let purchases = JSON.parse(data);

        if (shop) {
            purchases = purchases.filter((purchase) => purchase.shopId === shop);
        }
        if (product) {
            product=product.split(',');
            purchases = purchases.filter((purchase) => product.find(pd1=>pd1==purchase.productid));
        }
        
        if (sort) {
            const sortOptions = sort.split(",");
            sortOptions.forEach((option) => {
                switch (option) {
                    case "QtyAsc":
                        purchases.sort((a, b) => a.quantity - b.quantity);
                        break;
                    case "QtyDesc":
                        purchases.sort((a, b) => b.quantity - a.quantity);
                        break;
                    case "ValueAsc":
                        purchases.sort((a, b) => a.price * a.quantity - b.price * b.quantity);
                        break;
                    case "ValueDesc":
                        purchases.sort((a, b) => b.price * b.quantity - a.price * a.quantity);
                        break;
                    default:
                        break;
                }
            });
        }

        res.send(purchases);
    });
});

app.get("/purchases/shops/:id", function (req, res) {
    const shopId = +req.params.id;
    fs.readFile(fpurchases, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchases = JSON.parse(data);
            const shopPurchases = purchases.filter((purchase) => purchase.shopId === shopId);
            res.send(shopPurchases);
        }
    });
});

app.get("/purchases/products/:id", function (req, res) {
    const productId = +req.params.id;
    fs.readFile(fpurchases, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchases = JSON.parse(data);
            const productPurchases = purchases.filter((purchase) => purchase.productid === productId);
            res.send(productPurchases);
        }
    });
});

app.get("/totalPurchase/shop/:id", function (req, res) {
    const shopId = +req.params.id;
    fs.readFile(fpurchases, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const purchases = JSON.parse(data);
            const shopPurchases = purchases.filter((purchase) => purchase.shopId === shopId);

            const productWiseTotalPurchase = shopPurchases.reduce((acc, purchase) => {
                const productId = purchase.productid;
                const totalValue = purchase.quantity;
                acc[productId] = acc[productId] ? acc[productId] + totalValue : totalValue;
                return acc;
            }, {});

            res.send(productWiseTotalPurchase);
        }
    });
});

app.get("/totalPurchase/product/:id", function (req, res) {
    const productId = +req.params.id;
    fs.readFile(fpurchases, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const purchases = JSON.parse(data);
            const productPurchases = purchases.filter((purchase) => purchase.productid === productId);

            const shopWiseTotalPurchase = productPurchases.reduce((acc, purchase) => {
                const shopId = purchase.shopId;
                const totalValue =purchase.quantity;
                acc[shopId] = acc[shopId] ? acc[shopId] + totalValue : totalValue;
                return acc;
            }, {});

            res.send(shopWiseTotalPurchase);
        }
    });
});


app.post("/purchases",function(req,res){
    let body=req.body;
    fs.readFile(fpurchases,"utf8",function(err,data){
        if (err) res.status(404).send(err);
        else{
            let obj=JSON.parse(data);
            let maxId=obj.reduce((acc,curr)=>curr.purchaseId>=acc?curr.purchaseId:acc,0);
            let newId=maxId+1;
            let newPurchases={purchaseId:newId,...body};
            obj.push(newPurchases);
            let data1=JSON.stringify(obj);
            fs.writeFile(fproducts,data1,function(err){
                if(err) res.status(404).send(err);
                else res.send(newPurchases);
            })
        }
    })
})
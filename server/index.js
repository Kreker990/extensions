import express from 'express';
import { dataModel } from './models/dataModel.js';
const app = express();

app.use(express.json());

app.use((req, res, next) =>
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.get('/data', (req, res) =>
{
    let data = dataModel();
    if (data.active === false) data = [];
    res.send(data);
})

app.listen(4444, (err) =>
{
    if (err) return console.log(err);
    console.log("server ok");
})
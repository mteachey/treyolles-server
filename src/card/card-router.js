const express = require('express')

const cardRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const { cards,lists } = require('../store.js')

cardRouter
    .route('/card')
    .get((req, res)=>{
        res
        .json(cards);
    })
    .post(bodyParser, (req, res)=>{
        const { title, content } = req.body;

        //validate
        if(!title){
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        if(!content){
            logger.error(`Content is required`);
            return res
            .status(400)
            .send('Invalid data');
        }

        //generate ID and push card to array
        const id = uuid();

        const card = {
            id,
            title,
            content
        };

        cards.push(card);

        //log createion and send response
        logger.info(`Card with id ${id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(card);
    });

cardRouter
    .route('/card/:id')
    .get((req, res)=>{
        const { id } = req.params;
        const card = cards.find(c => c.id == id);

        if(!card){
            logger.error(`Card with id ${id} not found`);
            return res
                .status(404)
                .send('Card Not Found');
        }

        res.json(card);
    })
    .delete((req, res)=>{
        const { id } = req.params;

        const cardIndex = cards.findIndex(c => c.id === id);
        
        if(cardIndex === -1){
            logger.error(`Card with id ${id} not found`);
            return res
                .status(404)
                .send('Not found')
        }
        
        //remove card from all lists and assume no duplicate cards in list
        lists.forEach(list => {
            const cardIds = list.cardIds.filter(cid =>cid !==id);
            list.cardIds = cardIds;
        })
        
        cards.splice(cardIndex, 1);
        
        logger.info(`Card with id ${id} deleted`);
        res
            .status(204)
            .end();
    })

module.exports = cardRouter;

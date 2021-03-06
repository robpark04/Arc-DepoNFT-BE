import { FastifyReply, FastifyRequest } from "fastify";
import { ActivityController } from "../../controller/ActivityController";
import { NFTOwnerController } from "../../controller/NFTOwnerController";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";

/**
 * Get all NFTs in collection
 * Method: GET
 *
 * @param {*} req
 * @param {*} res
 *    Array<IActivity>
 */
export const getAllActivites = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const userSession = req["session"] as any;
  const loginUser =  userSession.walletId.toLowerCase();
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;

  const ctl = new ActivityController();
  const result = await ctl.getAllActivites(filters,loginUser);

  res.send(result);
};

/**
 * Owner place a bid to the NFT item in collection
 * Method: POST
 *
 * @param {*} req
 *    collectionId: Collection Id
 *    nftId:    Index of NFT item in collection
 *    seller:     seller wallet address
 *    price:    price for sale
 *    endDate:     end date
 *    fee:        seller's fee
 * @param {*} res
 *    success:  200
 *    fail:     501
 */
export const listForSale = async (req: FastifyRequest, res: FastifyReply) => {
  const userSession = req["session"] as any;
  const loginUser =  userSession.walletId.toLowerCase();
  const { collectionId, nftId, seller, price, startDate, endDate,r,s,v } = req.body as any;

  const ctl = new ActivityController();
  const owner = new NFTOwnerController();
  const findPerson=await owner.findPerson(seller);
  const result = await ctl.listForSale(collectionId, nftId, seller, price ?? 0, startDate ?? 0,endDate ?? 0,r ?? "" ,s ?? "" ,v ??"", loginUser?? "");
  res.send(result);
};


export const listForSaleBatch = async (req: FastifyRequest, res: FastifyReply) => {
  const userSession = req["session"] as any;
  const loginUser =  userSession.walletId.toLowerCase();
  const {batchId} = req.params as any;

  const {seller, startDate, endDate,r,s,v } = req.body as any;
  
  const ctl = new ActivityController();
  const result = await ctl.listForSaleBatch(  batchId, seller, startDate, endDate,r,s,v,loginUser?? "");
  res.send(result);
};

// export const listForSaleBatch = async (req: FastifyRequest, res: FastifyReply) => {
//   const userSession = req["session"] as any;
//   const loginUser =  userSession.walletId.toLowerCase();
  
//   const { collectionId, seller, startDate, endDate,r,s,v,items } = req.body as any;
  
//   const ctl = new ActivityController();
//   const result = await ctl.listForSaleBatch(  collectionId, seller, startDate, endDate,r,s,v,items,loginUser?? "");
//   res.send(result);
// };


export const makeOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId, seller, buyer, price, endDate } = req.body as any;
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const ctl = new ActivityController();
  const owner = new NFTOwnerController();
  const findPerson=await owner.findPerson(buyer);
  const result = await ctl.makeOffer(collectionId, nftId, seller, buyer, price, endDate, loginUser?? "");
  res.send(result);
};

export const approveOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId, seller, buyer, activityId } = req.body as any;
  const ctl = new ActivityController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const result = await ctl.approveOffer(collectionId, nftId, seller, buyer, activityId, loginUser?? "");
  res.send(result);
};

export const transfer = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId, seller, buyer,price } = req.body as any;
  const ctl = new ActivityController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const result = await ctl.transfer(collectionId, nftId, seller, buyer, price,loginUser?? "");
  res.send(result);
};

export const cancelOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId, seller, buyer, activityId } = req.body as any;
  const ctl = new ActivityController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const result = await ctl.cancelOffer(collectionId, nftId, seller, buyer, activityId, loginUser?? "");
  res.send(result);
};

export const cancelListForSale = async (req: FastifyRequest, res: FastifyReply) => {
  const userSession = req["session"] as any;
  const loginUser =  userSession.walletId ?? null;

  const { collectionId, nftId, seller, activityId } = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.cancelListForSale(collectionId, nftId, seller, activityId,loginUser?? "");
  res.send(result);
};

export const makeCollectionOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, seller, buyer, price, endDate } = req.body as any;
  const ctl = new ActivityController();
  const owner = new NFTOwnerController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  // const findPerson=await owner.findPerson(buyer);

  const result = await ctl.makeCollectionOffer(collectionId, seller, buyer, price, endDate, loginUser?? "");
  res.send(result);
};

export const cancelCollectionOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const {activityId, collectionId, seller , buyer} = req.body as any;
  const ctl = new ActivityController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const result = await ctl.cancelCollectionOffer(activityId,collectionId, seller,buyer, loginUser?? "");
  res.send(result);
};

export const signOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const { id, r, s, v } = req.body as any;
  const ctl = new ActivityController();
  const userSession = req["session"] as any;
  const loginUser =  userSession?.walletId.toLowerCase();
  const result = await ctl.signOffer(id, r, s, v, loginUser?? "");
  res.send(result);
};


/** delete activity
 * @param activityId
 * 
 */

export const deleteActivityId = async(req: FastifyRequest, res: FastifyReply) => {

  const {id} = req.params as any;
   
  const userSession = req["session"] as any;
  // const result = await ctl.deleteItem(id, userSession.walletId.toLowerCase());  
  const ctl = new ActivityController();
  const result= await ctl.deleteActivity(id,userSession.walletId.toLowerCase());
  
  res.send(result);
}



// src/app/api/item/route.js 
import { getClientPromise } from "@/lib/mongodb"; 
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils"; 

export async function GET(request) { 
  try { 
    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    // Filter out deleted items using $ne (not equal)
    const itemList = await db.collection("item").find({ status: { $ne: "DELETED" } }).toArray(); 
    return successResponse({ itemList }, 201); 
  } catch (error) { 
    printExceptionLog("GET Items", error); 
    return errorResponse("GET Item Internal Error", 500); 
  } 
} 

export async function POST(request) { 
  try { 
    const data = await request.json(); 
    const name = data.name; 
    const category = data.category; 
    const price = data.price; 
    const amount = data.amount; 

    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    const insertResult = await db.collection("item").insertOne({ 
      name: name, 
      category: category, 
      price: price, 
      amount: amount, 
      status: "ACTIVE", // Automatically assign ACTIVE status on creation
    }); 
    return successResponse( 
      { 
        id: insertResult.insertedId, 
      }, 
      201, 
    ); 
  } catch (error) { 
    printExceptionLog("POST Items", error); 
    return errorResponse("POST Item Internal Error", 500); 
  } 
}
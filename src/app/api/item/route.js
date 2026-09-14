import { getClientPromise } from "@/lib/mongodb"; 
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils"; 

export async function GET(request) { 
  try { 
    // 1. Authentication Check: Make sure user has a token cookie
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return errorResponse("Unauthorized", 401);
    }

    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    
    // Filter out deleted items using $ne (not equal)
    const itemList = await db.collection("item").find({ status: { $ne: "DELETED" } }).toArray(); 
    return successResponse({ itemList }, 200); 
  } catch (error) { 
    printExceptionLog("GET Items", error); 
    return errorResponse("GET Item Internal Error", 500); 
  } 
} 

export async function POST(request) { 
  try { 
    // 1. Authentication Check
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return errorResponse("Unauthorized", 401);
    }

    const data = await request.json(); 
    const name = data.name; 
    const category = data.category; 
    const price = data.price; 
    const amount = data.amount; 

    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    
    // 2. Insert Item
    const insertResult = await db.collection("item").insertOne({ 
      name: name, 
      category: category, 
      price: price, 
      amount: amount, 
      status: "ACTIVE", 
    }); 

    // 3. Database Audit Logging
    await db.collection("auditLogs").insertOne({
      action: "CREATE_ITEM",
      itemId: insertResult.insertedId,
      itemName: name,
      timestamp: new Date(),
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
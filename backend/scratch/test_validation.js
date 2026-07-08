import { createParkingSchema } from "../src/owner/parking/parking.schema.js";
import { updateOwnerProfileSchema } from "../src/owner/kyc/kyc.schema.js";

console.log("=== Testing Owner Profile KYC Schema (Global Terms) ===");

// 1. Missing globalTermsAccepted (should succeed because it's optional during normal profile updates, but if passed, must be true)
try {
  const res = updateOwnerProfileSchema.parse({
    body: {
      name: "Test Owner",
      ownerType: "commercial",
    }
  });
  console.log("✅ Success: updateOwnerProfileSchema succeeded without globalTermsAccepted (optional case).");
} catch (err) {
  console.error("❌ Unexpected failure:", err);
}

// 2. globalTermsAccepted as false (should fail!)
try {
  updateOwnerProfileSchema.parse({
    body: {
      name: "Test Owner",
      globalTermsAccepted: false,
    }
  });
  console.log("❌ Failure: updateOwnerProfileSchema allowed globalTermsAccepted as false!");
} catch (err) {
  console.log("✅ Success: updateOwnerProfileSchema correctly rejected globalTermsAccepted as false. Error detail:");
  console.log(err.message || err);
}

// 3. globalTermsAccepted as true (should succeed)
try {
  const res = updateOwnerProfileSchema.parse({
    body: {
      name: "Test Owner",
      globalTermsAccepted: true,
    }
  });
  console.log("✅ Success: updateOwnerProfileSchema accepted globalTermsAccepted as true.");
} catch (err) {
  console.error("❌ Unexpected failure:", err);
}

console.log("\n=== Testing Create Parking Schema (Legal Declaration) ===");

const validBaseBody = {
  name: "Plaza Parking",
  parkingType: "commercial",
  address: "Sector 62, Noida",
  latitude: 28.62,
  longitude: 77.38,
  openTime: "08:00",
  closeTime: "22:00",
  is24hr: false,
  ownershipType: "owned",
  propertyPaper: "https://example.com/prop.pdf",
  parkingAreaPics: ["https://example.com/pic1.jpg"],
};

// 1. Missing legalDeclarationAccepted (should fail!)
try {
  createParkingSchema.parse({
    body: {
      ...validBaseBody
    }
  });
  console.log("❌ Failure: createParkingSchema allowed listing without legalDeclarationAccepted!");
} catch (err) {
  console.log("✅ Success: createParkingSchema correctly rejected missing legalDeclarationAccepted. Error detail:");
  console.log(err.message || err);
}

// 2. legalDeclarationAccepted as false (should fail!)
try {
  createParkingSchema.parse({
    body: {
      ...validBaseBody,
      legalDeclarationAccepted: false,
    }
  });
  console.log("❌ Failure: createParkingSchema allowed listing with legalDeclarationAccepted = false!");
} catch (err) {
  console.log("✅ Success: createParkingSchema correctly rejected legalDeclarationAccepted = false. Error detail:");
  console.log(err.message || err);
}

// 3. legalDeclarationAccepted as true (should succeed)
try {
  const res = createParkingSchema.parse({
    body: {
      ...validBaseBody,
      legalDeclarationAccepted: true,
    }
  });
  console.log("✅ Success: createParkingSchema accepted valid body with legalDeclarationAccepted = true.");
} catch (err) {
  console.error("❌ Unexpected failure:", err);
}

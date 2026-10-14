const Property = require("../models/Property");

const generatePropertyCode = async () => {
  const year = new Date().getFullYear();

  const count = await Property.countDocuments();

  const number = String(count + 1).padStart(6, "0");

  return `BCP-${year}-${number}`;
};

const createProperty = async (req, res) => {
  try {
    const {
      surveyNumber,
      propertyType,
      address,
      village,
      taluka,
      district,
      state,
      pincode,
      area,
      areaUnit,
      description,
      latitude,
      longitude,
    } = req.body;

    if (
      !surveyNumber ||
      !propertyType ||
      !address ||
      !district ||
      !state ||
      !area
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Survey number, property type, address, district, state and area are required",
      });
    }

    const propertyCode = await generatePropertyCode();

    const property = await Property.create({
      propertyCode,
      currentOwner: req.user.userId,

      surveyNumber,
      propertyType,

      address,
      village,
      taluka,
      district,
      state,
      pincode,

      area,
      areaUnit: areaUnit || "sq.ft",

      description,

      latitude,
      longitude,

      verificationStatus: "PENDING",
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Property registration request created",
      property,
    });
  } catch (error) {
    console.error("Property creation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register property",
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      currentOwner: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get my properties error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch properties",
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate(
      "currentOwner",
      "fullName bcid mobile address identityVerificationStatus"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch property",
    });
  }
};

const getPropertyOwnershipHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const OwnershipHistory = require("../models/OwnershipHistory");

    const history = await OwnershipHistory.find({ property: id })
      .populate("previousOwner", "fullName bcid")
      .populate("newOwner", "fullName bcid")
      .populate("governmentOffice", "officeName officeCode district")
      .sort({ transferDate: 1, createdAt: 1 });

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get ownership history error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch ownership history",
    });
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  getPropertyById,
  getPropertyOwnershipHistory,
};
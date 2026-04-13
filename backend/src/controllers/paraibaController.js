import Paraiba from "../models/Paraiba.js";

export async function createParaibaEntry(req, res) {
  try {
    const {
      name,
      address,
      category,
      categoryType,
      reviewCount,
      rating,
      description,
      sentimentRating,
      ranking,
      upvotes,
      mentionCount,
      location,
      comments,
      googleReviews,
      link,
      servesBreakfast,
      servesBrunch,
      servesLunch,
      servesDinner,
      servesBeer,
      servesWine,
      servesVegetarian,
      dineIn,
      takeout,
      delivery,
    } = req.body;

    const entry = new Paraiba({
      name,
      address,
      category,
      categoryType,
      reviewCount,
      rating,
      description,
      sentimentRating,
      ranking,
      upvotes,
      mentionCount,
      location,
      comments,
      googleReviews,
      link,
      servesBreakfast,
      servesBrunch,
      servesLunch,
      servesDinner,
      servesBeer,
      servesWine,
      servesVegetarian,
      dineIn,
      takeout,
      delivery,
    });
    const savedEntry = await entry.save();

    return res.status(201).json({
      message: "Entry created successfully",
      entry: savedEntry,
    });
  } catch (error) {
    console.log("Error in createParaibaEntry controller", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Jimin
export async function getParaibaEntries(req, res) {
  try {
    const { category, categoryType, limit } = req.query;

    const settingFilters = new Set(["indoor", "outdoor", "indoor/outdoor"]);

    // Parse limit (default 5)
    const resultLimit = parseInt(limit) || 5;

    // Parse comma-separated categoryType filters
    const typeFilters = categoryType
      ? categoryType.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    let query = {};

    // Build category query
    if (category) {
      const normalizedCategory = category.toLowerCase();

      if (normalizedCategory === "restaurant") {
        query = {
          $or: [
            { category: { $regex: "restaurant", $options: "i" } },
            { category: { $regex: "food", $options: "i" } },
          ],
        };
      } else if (normalizedCategory === "attraction") {
        query = {
          $and: [
            {
              $or: [
                { category: { $regex: "establishment", $options: "i" } },
                { category: { $regex: "attraction", $options: "i" } },
              ],
            },
            {
              category: { $not: /restaurant|food/i },
            },
          ],
        };
      } else {
        query = {
          category: { $regex: category, $options: "i" },
        };
      }
    }

    // Apply categoryType filters.
    // Non-setting filters stay OR'd together (e.g. hiking OR swimming),
    // while setting filters narrow the results further (e.g. AND indoor).
    if (typeFilters.length > 0) {
      const generalFilters = typeFilters.filter(filter => !settingFilters.has(filter.toLowerCase()));
      const selectedSettings = typeFilters.filter(filter => settingFilters.has(filter.toLowerCase()));

      const andClauses = [];

      if (generalFilters.length > 0) {
        andClauses.push({
          $or: generalFilters.map(filter => ({
            categoryType: { $regex: filter, $options: "i" },
          })),
        });
      }

      if (selectedSettings.length > 0) {
        andClauses.push({
          $or: selectedSettings.map(filter => ({
            categoryType: { $regex: filter, $options: "i" },
          })),
        });
      }

      // If only one class of filters is selected, this still works as expected.
      // Example:
      // - hiking,swimming        => (hiking OR swimming)
      // - indoor                 => (indoor)
      // - hiking,swimming,indoor => (hiking OR swimming) AND (indoor)
      if (andClauses.length > 0) {
        if (query.$and) {
          query.$and.push(...andClauses);
        } else {
          query.$and = andClauses;
        }
      }
    }

    const entries = await Paraiba.find(query).sort({ ranking: -1 }).limit(resultLimit);
    console.log(`Returning ${entries.length} entries (limit: ${resultLimit}, filters: ${typeFilters.join(", ") || "none"})`);
    return res.status(200).json(entries);
  } catch (error) {
    console.log("Error in getParaibaEntries controller", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

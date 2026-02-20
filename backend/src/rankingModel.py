import math
# The current version is only focused on the Google data, as real data is not pulled up yet. 

# Top-level weights for each group (must sum to 1.0)
redditWeight  = 0.40   # Reddit mention count + average upvotes
mlWeight      = 0.30   # VADER sentiment score
googleWeight  = 0.30   # Google rating + review count

# Within the Google group (must sum to 1.0)
googleRatingWeight    = 0.60  # higher rating = better
googleObscurityWeight = 0.40  # fewer reviews = more hidden

# Review count ceiling for obscurity normalization where a place above this count will score 0 on obscurity.
reviewCeiling = 1000

# Reddit normalization ceilings, which will be modified after seeing real data.
mentionCeiling  = 50  
upvoteCeiling   = 200  

# Calculates the Reddit Score portion of the ranking model.
def redditScore(mentionCount: int, upvoteCount: float) -> float:
    mentionLog     = math.log(mentionCount + 1)
    ceilingLog     = math.log(mentionCeiling + 1)
    mentionNorm    = min(1.0, mentionLog / ceilingLog)

    upvoteLog      = math.log(upvoteCount + 1)
    upvoteCeilLog  = math.log(upvoteCeiling + 1)
    upvoteNorm     = min(1.0, upvoteLog / upvoteCeilLog)

    return round((mentionNorm + upvoteNorm) / 2, 4)

# Calculates the ML Score portion of the ranking model.
def mlScore(sentimentScore: float) -> float:
    return round(sentimentScore, 4)

# Calculates Google Score portion of the ranking model.
def googleScore(googleRating: float, googleReviews: int) -> float:
    ratingNorm = googleRating / 5.0

    reviewLog      = math.log(googleReviews + 1)
    ceilingLog     = math.log(reviewCeiling + 1)
    obscurityScore = max(0.0, 1.0 - (reviewLog / ceilingLog))

    gScore = (googleRatingWeight * ratingNorm) + (googleObscurityWeight * obscurityScore)
    return round(gScore, 4)


def paraibaScore(
    googleRating: float,
    googleReviews: int,
    redditMentions: int,
    averageUpvotes: float,
    sentimentScore: float,
) -> dict:

    rScore = redditScore(redditMentions, averageUpvotes)
    mScore = mlScore(sentimentScore)
    gScore = googleScore(googleRating, googleReviews)

    initialScore = (
        redditWeight * rScore +
        mlWeight     * mScore +
        googleWeight * gScore
    )

    finalScore = round(initialScore * 100, 2)

    return {
        "Paraíba Score": finalScore,
        "Reddit Score":  rScore,
        "ML Score":      mScore,
        "Google Score":  gScore,
    }


def scoreDestinations(destinations: list[dict]) -> list[dict]:
    """
    Scores a list of destination dicts and returns them sorted highest to lowest.
    """
    results = []
    for destination in destinations:
        try:
            scoreResult = paraibaScore(
                googleRating=destination["googleRating"],
                googleReviews=destination["googleReviews"],
                redditMentions=destination["redditMentions"],
                averageUpvotes=destination["averageUpvotes"],
                sentimentScore=destination["sentimentScore"],
            )

        except (KeyError, ValueError) as e:
            scoreResult = {
                "Paraíba Score": 0.0,
                "Reddit Score": None,
                "ML Score": None,
                "Google Score": None,
                "error": str(e),
            }

        results.append({**destination, "Score Result": scoreResult})

    results.sort(key=lambda x: x["Score Result"]["Paraíba Score"], reverse=True)
    return results

# Testing samples from real locations in GNV. Reddit and ML score factors are same for this phase. 
if __name__ == "__main__":
    testDestinations = [
        {
            "name": "Pearl's Country Store",
            "googleRating": 4.6,
            "googleReviews": 3043,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Adam's Rib Co",
            "googleRating": 4.5,
            "googleReviews": 2033,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "La Tienda",
            "googleRating": 4.5,
            "googleReviews": 2952,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "La Cocina de Abuela",
            "googleRating": 4.6,
            "googleReviews": 768,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Flatfish GNV",
            "googleRating": 4.7,
            "googleReviews": 158,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "M&D West African Cuisine",
            "googleRating": 4.9,
            "googleReviews": 195,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Di Big Jerk",
            "googleRating": 4.3,
            "googleReviews": 146,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Caribbean Spice",
            "googleRating": 4.2,
            "googleReviews": 529,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Uppercrust",
            "googleRating": 4.7,
            "googleReviews": 821,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
        {
            "name": "Mi Apa Latin Cafe",
            "googleRating": 4.6,
            "googleReviews": 4974,
            "redditMentions": 8,
            "averageUpvotes": 25,
            "sentimentScore": 0.72,
        },
    ]

    ranked = scoreDestinations(testDestinations)

    print("=== Project Paraíba — Hidden Gem Rankings ===")
    print(f"Weights = Reddit: {redditWeight}  |  ML: {mlWeight}  |  Google: {googleWeight}\n")
    for i, dest in enumerate(ranked, 1):
        r = dest["Score Result"]
        print(f"{i}. {dest['name']}")
        print(f"   Score:   {r['Paraíba Score']} / 100")
        print(f"   Reddit: {r['Reddit Score']}  |  ML: {r['ML Score']}  |  Google: {r['Google Score']}\n")

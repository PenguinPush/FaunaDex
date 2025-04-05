import requests


def get_cv_suggestions(image_path):

    url = "https://api.inaturalist.org/v1/computervision/score_image"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Open the image file in binary mode
    with open(image_path, "rb") as image_file:
        files = {"file": image_file}
        response = requests.post(url, files=files)

    # Check if the request was successful
    if response.status_code == 200:
        # The JSON response typically contains a list under "results"
        # with each suggestion including a taxon id, name, and a score/confidence.
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None


if __name__ == "__main__":
    # Replace with your local image file path
    image_path = "/Users/edwardwang/Downloads/cat.jpeg"
    token = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjo5MDk2MTUxLCJleHAiOjE3NDM5NDUxODB9.anLkRVFvwOfJB_x5PcnzDTXjZw4dxSR82yIAFVJPE_gZypCDw1P0_PYsNnfZo7lHCc_S6IvRI5tuPRkzcXySVQ"
    suggestions = get_cv_suggestions(image_path)
    if suggestions:
        # Pretty-print the suggestions
        import json

        print(json.dumps(suggestions, indent=2))

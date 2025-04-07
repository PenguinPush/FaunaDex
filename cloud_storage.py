from google.cloud import storage
import os

def upload_image(source_file_name, destination_blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket("faunadex-storage")
    blob = bucket.blob(destination_blob_name)
    generation_match_precondition = 0

    blob.upload_from_filename(source_file_name, if_generation_match=generation_match_precondition)

    print(
        f"File {source_file_name} uploaded to {destination_blob_name}."
    )


def fetch_image(filename):
    bucket_name = "faunadex-storage"
    print("fetching!")

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.download_to_filename(os.path.join('uploads', filename))

    print(
        "Downloaded storage object {} from bucket {} to local file uploads/{}.".format(
            filename, bucket_name, filename
        )
    )


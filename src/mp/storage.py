from storages.backends.s3 import S3Storage


class SupabasePublicStorage(S3Storage):
    """
    Stores files in Supabase Storage using its S3-compatible API,
    but returns Supabase's permanent public URL for each file.
    """

    def url(self, name):
        return (
            "https://sxkayxygouvjhortiqbb.supabase.co"
            f"/storage/v1/object/public/"
            f"{self.bucket_name}/{name}"
        )
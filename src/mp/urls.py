
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    path('', include("accounts.urls")),
    path('', include("products.urls")),
    path('', include("baskets.urls")),
    path('', include("orders.urls")),
    path('admin/', admin.site.urls),
]

# In development, redirect root to the Vite dev server so visiting Django root opens the frontend.
# Do NOT redirect other paths (API, media, static) to avoid breaking media and API endpoints.
if settings.DEBUG:
    urlpatterns += [
        path('', RedirectView.as_view(url='http://localhost:5174/', permanent=False)),
    ]

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

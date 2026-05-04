from rest_framework.routers import DefaultRouter
from .views import DossierViewSet

router = DefaultRouter()
# on enregistre le viewset DossierViewSet pour les urls dossiers
# basename='dossier' est le nom de la route
router.register(r'dossiers', DossierViewSet, basename='dossier')

# on exporte les urls du router pour les urls dossiers
urlpatterns = router.urls

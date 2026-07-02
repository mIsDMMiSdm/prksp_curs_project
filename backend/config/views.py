from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@extend_schema(
    tags=["system"],
    summary="Проверка работоспособности API",
    auth=[],
    responses={200: {"type": "object", "properties": {"status": {"type": "string"}}}},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "warehouse-orders-api",
        }
    )

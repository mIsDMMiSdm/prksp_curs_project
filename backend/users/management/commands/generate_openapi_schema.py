from pathlib import Path

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Сгенерировать OpenAPI-схему в docs/openapi/openapi.yaml"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default=None,
            help="Путь к файлу (по умолчанию: docs/openapi/openapi.yaml в корне репозитория)",
        )

    def handle(self, *args, **options):
        repo_root = Path(__file__).resolve().parents[4]
        output_path = (
            Path(options["output"])
            if options["output"]
            else repo_root / "docs" / "openapi" / "openapi.yaml"
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)

        from django.core.management import call_command

        call_command(
            "spectacular",
            file=str(output_path),
            validate=True,
        )
        self.stdout.write(
            self.style.SUCCESS(f"OpenAPI-схема сохранена: {output_path}")
        )

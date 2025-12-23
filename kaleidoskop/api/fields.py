from django.core.validators import get_available_image_extensions, FileExtensionValidator
from django.forms import ImageField

def validate_image_and_svg_file_extension(value):
    allowed_extensions = get_available_image_extensions() + ["svg"]
    return FileExtensionValidator(allowed_extensions=allowed_extensions)(value)

class SVGAndImageFormField(ImageField):
    default_validators = [validate_image_and_svg_file_extension]
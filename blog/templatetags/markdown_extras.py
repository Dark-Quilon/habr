import markdown
from django import template
from django.utils.safestring import mark_safe

register = template.Library()


@register.filter(name='markdownify')
def markdownify(value):
    """Render Markdown string to safe HTML."""
    md = markdown.markdown(
        value,
        extensions=['fenced_code', 'tables']
    )
    return mark_safe(md)

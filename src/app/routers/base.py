from abc import ABC, abstractmethod
from typing import Any, Dict, List

from fastapi import APIRouter


class BaseUtilityRouter(ABC):
    """Base class for utility routers"""

    def __init__(self, prefix: str, tags: List[str] = None):
        self.router = APIRouter(prefix=prefix, tags=tags or [])
        self._setup_routes()

    @abstractmethod
    def get_utility_info(self) -> Dict[str, Any]:
        """Return information about this utility"""
        pass

    @abstractmethod
    def _setup_routes(self) -> None:
        """Setup the routes for this utility"""
        pass

    def _add_info_route(self) -> None:
        """Add a standard info route for the utility"""

        @self.router.get("/", summary="Get utility information")
        async def get_info():
            return self.get_utility_info()


class UtilityInfo:
    """Standard utility information structure"""

    def __init__(
        self,
        name: str,
        description: str,
        version: str = "1.0.0",
        endpoints: List[Dict[str, str]] = None,
    ):
        self.name = name
        self.description = description
        self.version = version
        self.endpoints = endpoints or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "utility": self.name,
            "description": self.description,
            "version": self.version,
            "endpoints": {ep["name"]: ep["description"] for ep in self.endpoints},
        }

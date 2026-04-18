from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class TicketArtefact(BaseModel):
    type: Literal["ticket"] = "ticket"
    pnr: str
    trainNumber: str
    trainName: str
    date: str
    time: str
    from_: str = Field(alias="from")
    to: str
    classCode: str | None = None

    model_config = {"populate_by_name": True}


class ProgressSegment(BaseModel):
    station: str
    status: Literal["completed", "ontime", "delayed"]
    delayMinutes: int | None = None


class ProgressArtefact(BaseModel):
    type: Literal["progress"] = "progress"
    trainLabel: str
    segments: list[ProgressSegment]
    summary: str | None = None


class AlertArtefact(BaseModel):
    type: Literal["alert"] = "alert"
    severity: Literal["warning", "critical"]
    title: str
    body: str


Artefact = Annotated[
    Union[TicketArtefact, ProgressArtefact, AlertArtefact],
    Field(discriminator="type"),
]


class TextContent(BaseModel):
    type: Literal["text"] = "text"
    text: str


class ArtefactContent(BaseModel):
    type: Literal["artefact"] = "artefact"
    artefact: Artefact


class GroupContent(BaseModel):
    type: Literal["group"] = "group"
    items: list["MessageContent"]


MessageContent = Annotated[
    Union[TextContent, ArtefactContent, GroupContent],
    Field(discriminator="type"),
]


class MessageEnvelope(BaseModel):
    content: list[MessageContent]


class ChatRequest(BaseModel):
    text: str
    lang: str | None = None
    userId: str | None = None


class ChatResponse(BaseModel):
    messages: list[MessageEnvelope]


GroupContent.model_rebuild()
MessageEnvelope.model_rebuild()

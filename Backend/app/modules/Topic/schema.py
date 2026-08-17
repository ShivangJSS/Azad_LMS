from typing import List

from pydantic import BaseModel


# -------------------------
# List Topic Response
# -------------------------

class TopicListResponse(BaseModel):
    topic_id: int
    topic_name: str
    module_name: str
    language_id: int
    status: str


# -------------------------
# Add Topic
# -------------------------

class TopicItem(BaseModel):
    topic_name: str
    is_active: str


class CreateTopicRequest(BaseModel):
    module_id: int
    topics: List[TopicItem]


# -------------------------
# View Topic
# -------------------------

class TopicTranslationResponse(BaseModel):
    topic_id: int
    parent_id: int
    language_id: int
    topic_name: str


class TopicViewResponse(BaseModel):
    module_name: str
    status: str
    translations: List[TopicTranslationResponse]


# -------------------------
# Delete Topic
# -------------------------

class DeleteTopicResponse(BaseModel):
    success: bool
    message: str



#--------------------------
# translation 
# -------------------------


class TopicTranslationRequest(BaseModel):
    language_id: int
    topic_name: str
    is_active: str = "1"


#--------------------------
#edit
#--------------------------
class UpdateTopicRequest(BaseModel):
    module_id: int
    topic_name: str
    is_active: str
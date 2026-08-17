from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    text,
)
from sqlalchemy.sql import func
from app.database.database import Base






class DocumentMaster(Base):
    __tablename__ = "document_masters"

    doc_id = Column(Integer, primary_key=True,autoincrement=True)

    parent_id = Column(BigInteger)

    doc_title = Column(String(255))
    doc_description = Column(String)
    doc_category_id = Column(BigInteger)
    doc_image = Column(String)
    doc_file = Column(String)
    doc_type = Column(String)
    doc_ref_id = Column(BigInteger)
    status = Column(Integer)

    submodule_id = Column(BigInteger)
    module_id = Column(BigInteger)
    topic_id = Column(BigInteger)

    language_id = Column(Integer)

    self_paced_learning = Column(Integer)
    pre_session_assessment = Column(Integer)
    main_content_of_the_module = Column(Integer)
    post_session_assessment = Column(Integer)

    doc_duration = Column(String)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    deleted_at = Column(DateTime)




    
class LanguageMaster(Base):
    __tablename__ = "language_master"

    language_id = Column(BigInteger, primary_key=True)
    language_code = Column(String(10))
    language_name = Column(String(500))
    is_active = Column(Integer)

    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime)




class TopicMaster(Base):
    __tablename__ = "topic_master"

    topic_id = Column(Integer, primary_key=True)
    parent_id = Column(Integer)

    topic_name = Column(String(500))

    language_id = Column(Integer)
    module_id = Column(BigInteger)

    is_active = Column(String(1))

    created_at = Column(DateTime)
    updated_at = Column(DateTime)



class PdfMaster(Base):
    __tablename__ = "pdf_masters"

    pdf_id = Column(BigInteger, primary_key=True,autoincrement=True)

    pdf_unique_id = Column(String(100))
    pdf_name = Column(String(500))
    pdf_description = Column(String(1000))

    pdf_url = Column(String(1000))
    cloud_url = Column(String(1000))

    status = Column(Integer)

    created_at = Column(
     DateTime,
     server_default=func.now(),
)

    updated_at = Column(
      DateTime,
      server_default=func.now(),
      onupdate=func.now(),
)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)    





class PptMaster(Base):
    __tablename__ = "ppt_masters"

    ppt_id = Column(BigInteger, primary_key=True,autoincrement=True)

    ppt_unique_id = Column(String(100))
    ppt_name = Column(String(500))
    ppt_description = Column(String(1000))

    ppt_url = Column(String(1000))
    cloud_url = Column(String(1000))

    status = Column(Integer)

    created_at = Column(
     DateTime,
     server_default=func.now(),
)

    updated_at = Column(
     DateTime,
     server_default=func.now(),
     onupdate=func.now(),
)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)






class VideoMaster(Base):
    __tablename__ = "video_masters"

    video_id = Column(BigInteger, primary_key=True,autoincrement=True)

    video_unique_id = Column(String(100))
    video_name = Column(String(500))
    video_description = Column(String(1000))

    video_url = Column(String(1000))
    youtube_url = Column(String(1000))

    status = Column(Integer)

    created_at = Column(
     DateTime,
     server_default=func.now(),
)

    updated_at = Column(
     DateTime,
     server_default=func.now(),
     onupdate=func.now(),
)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)
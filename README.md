# node_spa_blog
내 블로그 백엔드 서버 구현(게시판 / 댓글)

posts(게시판)
- 전체 게시글 목록 조회(생성일자별 내림차순 정렬)
- 게시글 등록(모든 정보 입력이 되어야 생성되도록 validation check)
- 게시글 조회(db의 _id를 이용한 상세 조회)
- 게시글 수정(동일한 비밀번호 입력 시에만 수정이 되도록 구현)
- 게시글 삭제(동일한 비밀번호 입력 시에만 삭제가 되도록 구현)

comments(댓글)
- 댓글 목록 조회(해당 게시글의 모든 댓글만 보여주도록 구현, 생성일자별 내림차순 정렬)
- 댓글 작성(모든 정보 입력이 되어야 생성되도록 validation check)
- 댓글 수정(동일한 비밀번호 입력 시에만 수정이 되도록 구현)
- 댓글 삭제(동일한 비밀번호 입력 시에만 삭제가 되도록 구현)

상세 API
https://charming-castanet-ba9.notion.site/aabf27971457421bbcaf4eb3f111494f?v=e4f6e7f9b59a4bf098c7e485c972295f&pvs=4

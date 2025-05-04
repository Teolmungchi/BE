import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // Method Not Allowed Error
  METHOD_NOT_ALLOWED = '지원하지 않는 HTTP메소드입니다',

  // Not Found Error
  NOT_FOUND_END_POINT = '존재하지 않는 API 엔드포인트입니다.',
  NOT_FOUND_LOGIN_USER = '로그인한 사용자를 찾을 수 없습니다.',
  NOT_FOUND_AUTHORIZATION_HEADER = 'Authorization 헤더를 찾을 수 없습니다.',
  NOT_FOUND_USER = '사용자를 찾을 수 없습니다.',
  NOT_FOUND_CATS = '고양이를 찾을 수 없습니다.',
  NOT_FOUND_FEED = '피드(게시글)를 찾을 수 없습니다.',
  NOT_FOUND_LIKE = '좋아요를 누르지 않았습니다.',
  NOT_FOUND_CHAT_ROOM = '채팅방을 찾지 못했습니다.',
  NOT_FOUND_DATA = '데이터를 찾지 못했습니다.',

  // Invalid Argument Error
  MISSING_REQUEST_PARAMETER = '필수 요청 파라미터가 누락되었습니다.',
  INVALID_ARGUMENT_FORMAT = '요청에 유효하지 않은 인자입니다',
  INVALID_PARAMETER_FORMAT = '파라미터 형식이 잘못되었습니다.',
  INVALID_HEADER_ERROR = '유효하지 않은 헤더입니다',
  MISSING_REQUEST_HEADER = '필수 요청 헤더가 누락되었습니다.',
  BAD_REQUEST_PARAMETER = '잘못된 요청 파라미터입니다.',
  BAD_REQUEST_JSON = '잘못된 JSON 형식입니다.',
  SEARCH_SHORT_LENGTH_ERROR = '검색어는 2글자 이상이어야 합니다.',
  INVALID_ROLE = '유효하지 않은 권한입니다.',
  FAILURE_CHANGE_PASSWORD = '현재 비밀번호가 일치하지 않습니다.',

  // Access Denied Error
  ACCESS_DENIED = '접근 권한이 없습니다.',
  NOT_MATCH_AUTH_CODE = '인증 코드가 일치하지 않습니다.',
  NOT_MATCH_USER = '사용자 정보가 일치하지 않습니다.',

  // Unauthorized Error
  FAILURE_LOGIN = '잘못된 아이디 또는 비밀번호입니다.',
  EXPIRED_TOKEN_ERROR = '만료된 토큰입니다.',
  INVALID_TOKEN_ERROR = '유효하지 않은 토큰입니다.',
  TOKEN_MALFORMED_ERROR = '잘못된 토큰 형식입니다.',
  TOKEN_TYPE_ERROR = '잘못된 토큰 타입입니다.',
  TOKEN_UNSUPPORTED_ERROR = '지원하지 않는 토큰입니다.',
  TOKEN_GENERATION_ERROR = '토큰 생성에 실패했습니다.',
  TOKEN_UNKNOWN_ERROR = '알 수 없는 토큰입니다.',

  // Internal Server Error
  INTERNAL_SERVER_ERROR = '서버 내부 오류입니다.',
  UPLOAD_FILE_ERROR = '파일 업로드 URL 생성에 실패했습니다.',
  DOWNLOAD_FILE_ERROR = '파일 다운로드 URL 생성에 실패했습니다.',

  // Already Exist
  ALREADY_LIKED = '이미 좋아요를 눌렀습니다.',

  // ETC
  SAME_USER = '동일한 유저입니다.',
  NOT_IN_CHAT_ROOM = '해당 사용자는 채팅방의 참여자가 아닙니다.',
}

export function getHttpStatus(errorCode: ErrorCode): HttpStatus {
  switch (errorCode) {
    case ErrorCode.METHOD_NOT_ALLOWED:
      return HttpStatus.METHOD_NOT_ALLOWED;
    case ErrorCode.NOT_FOUND_END_POINT:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.NOT_FOUND_LOGIN_USER:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.NOT_FOUND_AUTHORIZATION_HEADER:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.NOT_FOUND_USER:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.NOT_FOUND_CATS:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.MISSING_REQUEST_PARAMETER:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.INVALID_ARGUMENT_FORMAT:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.INVALID_PARAMETER_FORMAT:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.INVALID_HEADER_ERROR:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.MISSING_REQUEST_HEADER:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.BAD_REQUEST_PARAMETER:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.BAD_REQUEST_JSON:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.SEARCH_SHORT_LENGTH_ERROR:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.INVALID_ROLE:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.ACCESS_DENIED:
      return HttpStatus.FORBIDDEN;
    case ErrorCode.NOT_MATCH_AUTH_CODE:
      return HttpStatus.FORBIDDEN;
    case ErrorCode.NOT_MATCH_USER:
      return HttpStatus.FORBIDDEN;
    case ErrorCode.FAILURE_LOGIN:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.EXPIRED_TOKEN_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.INVALID_TOKEN_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.TOKEN_MALFORMED_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.TOKEN_TYPE_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.TOKEN_UNSUPPORTED_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.TOKEN_GENERATION_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.TOKEN_UNKNOWN_ERROR:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.INTERNAL_SERVER_ERROR:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    case ErrorCode.UPLOAD_FILE_ERROR:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

import type { ParsedMention } from '../types/comment';

export interface ParseMentionsResult {
  content: string;
  mentions: ParsedMention[];
}

/**
 * Hàm parse nội dung comment chứa định dạng react-mentions (VD: "@[Nguyễn Văn A](user:123)")
 * Chuyển thành chuỗi hiển thị thuần ("@Nguyễn Văn A") và mảng thông tin vị trí các mention.
 */
export function parseMentions(content: string): ParseMentionsResult {
  const regex = /@\[([^\]]+)\]\(user:(\d+)\)/g;
  const mentions: ParsedMention[] = [];

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const display = match[1];
    const userId = Number(match[2]);

    // Text nằm trước mention
    result += content.slice(lastIndex, match.index);
    const startIndex = result.length;
    const mentionText = `@${display}`;
    result += mentionText;

    mentions.push({
      userId,
      startIndex,
      length: mentionText.length,
    });
    lastIndex = regex.lastIndex;
  }
  result += content.slice(lastIndex);

  return {
    content: result,
    mentions,
  };
}

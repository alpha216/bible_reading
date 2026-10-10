// 매년 1월 1일부터 주일을 제외하고 성경 66권의 읽기 분량을 자동 배정합니다.
const bibleBooks = [
  [
    "창세기",
    50
  ],
  [
    "출애굽기",
    40
  ],
  [
    "레위기",
    27
  ],
  [
    "민수기",
    36
  ],
  [
    "신명기",
    34
  ],
  [
    "여호수아",
    24
  ],
  [
    "사사기",
    21
  ],
  [
    "룻기",
    4
  ],
  [
    "사무엘상",
    31
  ],
  [
    "사무엘하",
    24
  ],
  [
    "열왕기상",
    22
  ],
  [
    "열왕기하",
    25
  ],
  [
    "역대상",
    29
  ],
  [
    "역대하",
    36
  ],
  [
    "에스라",
    10
  ],
  [
    "느헤미야",
    13
  ],
  [
    "에스더",
    10
  ],
  [
    "욥기",
    42
  ],
  [
    "시편",
    150
  ],
  [
    "잠언",
    31
  ],
  [
    "전도서",
    12
  ],
  [
    "아가",
    8
  ],
  [
    "이사야",
    66
  ],
  [
    "예레미야",
    52
  ],
  [
    "예레미야애가",
    5
  ],
  [
    "에스겔",
    48
  ],
  [
    "다니엘",
    12
  ],
  [
    "호세아",
    14
  ],
  [
    "요엘",
    3
  ],
  [
    "아모스",
    9
  ],
  [
    "오바댜",
    1
  ],
  [
    "요나",
    4
  ],
  [
    "미가",
    7
  ],
  [
    "나훔",
    3
  ],
  [
    "하박국",
    3
  ],
  [
    "스바냐",
    3
  ],
  [
    "학개",
    2
  ],
  [
    "스가랴",
    14
  ],
  [
    "말라기",
    4
  ],
  [
    "마태복음",
    28
  ],
  [
    "마가복음",
    16
  ],
  [
    "누가복음",
    24
  ],
  [
    "요한복음",
    21
  ],
  [
    "사도행전",
    28
  ],
  [
    "로마서",
    16
  ],
  [
    "고린도전서",
    16
  ],
  [
    "고린도후서",
    13
  ],
  [
    "갈라디아서",
    6
  ],
  [
    "에베소서",
    6
  ],
  [
    "빌립보서",
    4
  ],
  [
    "골로새서",
    4
  ],
  [
    "데살로니가전서",
    5
  ],
  [
    "데살로니가후서",
    3
  ],
  [
    "디모데전서",
    6
  ],
  [
    "디모데후서",
    4
  ],
  [
    "디도서",
    3
  ],
  [
    "빌레몬서",
    1
  ],
  [
    "히브리서",
    13
  ],
  [
    "야고보서",
    5
  ],
  [
    "베드로전서",
    5
  ],
  [
    "베드로후서",
    3
  ],
  [
    "요한일서",
    5
  ],
  [
    "요한이서",
    1
  ],
  [
    "요한삼서",
    1
  ],
  [
    "유다서",
    1
  ],
  [
    "요한계시록",
    22
  ]
];
function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
// 책의 경계를 유지하면서 하루 약 4장(3~5장)으로 분량을 조절합니다.
function formatPortion(name, start, end) {
    return `${name} ${start === end ? start : `${start}–${end}`}장`;
}
function buildReadingPortions() {
    const portions = [];
    for (let index = 0; index < bibleBooks.length; index++) {
        const [name, chapters] = bibleBooks[index];
        if (chapters <= 3) {
            const group = [formatPortion(name, 1, chapters)];
            let total = chapters;
            // 오바댜+요나, 스바냐+학개처럼 짧은 책은 다음 책과 묶습니다.
            while (index + 1 < bibleBooks.length && total + bibleBooks[index + 1][1] <= 5) {
                const [nextName, nextChapters] = bibleBooks[++index];
                total += nextChapters;
                group.push(formatPortion(nextName, 1, nextChapters));
            }
            portions.push(group.join(' · '));
            continue;
        }
        const days = Math.max(Math.ceil(chapters / 5), Math.ceil(chapters / 4 - 0.5));
        const base = Math.floor(chapters / days), extra = chapters % days;
        let start = 1;
        for (let day = 0; day < days; day++) {
            const count = base + (day < extra ? 1 : 0);
            portions.push(formatPortion(name, start, start + count - 1));
            start += count;
        }
    }
    return portions;
}
function generateSchedule(year) {
    if (!Number.isInteger(year) || year < 1000 || year > 9999) throw new Error('올바른 연도를 입력해 주세요.');
    const result = {};
    const date = new Date(year, 0, 1, 12);
    for (const reading of buildReadingPortions()) {
        while (date.getDay() === 0) date.setDate(date.getDate() + 1);
        result[dateKey(date)] = reading;
        date.setDate(date.getDate() + 1);
    }
    return result;
}

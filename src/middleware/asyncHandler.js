/*
  ليه أضفت Promise.resolve()؟
   عشان تتعامل مع نتيجة الدالة باعتبارها Promise，
    وتلتقط أخطاء الرفض، وكذلك الأخطاء المتزامنة التي تحصل أثناء استدعاء fn داخل Promise.resolve لا تُلتقط بهذه الصيغة إذا وقع الخطأ قبل إنشاء الـ Promise

*/


export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch((error) => next(error));
  };
};

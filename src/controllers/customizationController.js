const { CustomField, NumberingSequence, PrintTemplate, PaymentMethod, Check, WorkflowRule, Account, Branch, Department, CostCenter, Currency, TaxRule, PriceList, NotificationRule, Attachment } = require('../models');

const models = {
  'custom-fields': CustomField,
  'numbering-sequences': NumberingSequence,
  'print-templates': PrintTemplate,
  'payment-methods': PaymentMethod,
  'checks': Check,
  'workflow-rules': WorkflowRule,
  'branches': Branch,
  'departments': Department,
  'cost-centers': CostCenter,
  'currencies': Currency,
  'tax-rules': TaxRule,
  'price-lists': PriceList,
  'notification-rules': NotificationRule,
  'attachments': Attachment
};

const getModel = (type) => {
  const model = models[type];
  if (!model) throw new Error('النوع غير معروف');
  return model;
};

const list = async (req, res) => {
  const model = getModel(req.params.type);
  const rows = await model.findAll({ order: [['id', 'DESC']] });
  res.json(rows);
};

const getOne = async (req, res) => {
  const model = getModel(req.params.type);
  const row = await model.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'السجل غير موجود' });
  res.json(row);
};

const create = async (req, res) => {
  const model = getModel(req.params.type);
  const payload = { ...req.body };
  if (req.params.type === 'numbering-sequences' && !payload.title) {
    payload.title = payload.documentType || 'مستند';
  }
  const row = await model.create(payload);
  res.status(201).json(row);
};

const update = async (req, res) => {
  const model = getModel(req.params.type);
  const row = await model.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'السجل غير موجود' });
  const payload = { ...req.body };
  if (req.params.type === 'numbering-sequences' && !payload.title) {
    payload.title = payload.documentType || row.title || 'مستند';
  }
  await row.update(payload);
  res.json(row);
};

const remove = async (req, res) => {
  const model = getModel(req.params.type);
  const row = await model.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'السجل غير موجود' });
  await row.destroy();
  res.json({ message: 'تم الحذف بنجاح' });
};

const nextNumber = async (req, res) => {
  const { documentType } = req.params;
  const seq = await NumberingSequence.findOne({ where: { documentType } });
  if (!seq) return res.status(404).json({ message: 'إعدادات الترقيم غير موجودة' });
  const year = new Date().getFullYear();
  const number = String(seq.nextNumber).padStart(seq.padding, '0');
  const parts = [seq.prefix];
  if (seq.includeYear) parts.push(year);
  parts.push(number);
  res.json({ number: parts.join(seq.numberSeparator), nextNumber: seq.nextNumber });
};

const accountStatement = async (req, res) => {
  const { accountId } = req.params;
  const { JournalEntryLine, JournalEntry } = require('../models');
  const lines = await JournalEntryLine.findAll({
    where: { accountId },
    include: [{ model: JournalEntry }],
    order: [[JournalEntry, 'date', 'ASC'], ['id', 'ASC']]
  });
  let balance = 0;
  const rows = lines.map((l) => {
    balance += Number(l.debit || 0) - Number(l.credit || 0);
    return {
      التاريخ: l.JournalEntry?.date,
      الرقم: l.JournalEntry?.entryNumber,
      البيان: l.description || l.JournalEntry?.description,
      مدين: Number(l.debit || 0),
      دائن: Number(l.credit || 0),
      الرصيد: balance
    };
  });
  res.json({ accountId: Number(accountId), rows, balance });
};

module.exports = { list, getOne, create, update, remove, nextNumber, accountStatement };

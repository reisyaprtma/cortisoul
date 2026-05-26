import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';
import journalRepositories from '../repositories/journal-repositories.js';
import AuthorizationError from '../../../exceptions/authorization-error.js';
import { getWeekRange, WEEK_DAYS, formatToYmd } from '../../../utils/date.js';
import { journalToModel } from '../../../utils/mapDBToModel.js';
import { predictText } from '../../predicts/service/ai-service.js';

export const createJournal = async (req, res, next) => {
  const { title, content } = req.validated;
  const { id: owner } = req.user;

  const prediction = await predictText(content);
  if (!prediction) {
    console.error('[AI] Prediction failed');
  }

  const stressScoreValue = parseFloat(prediction.stress_score.toFixed(3));

  const journal = await journalRepositories.createJournal({
    title,
    content,
    stressScore: stressScoreValue,
    emotion: prediction?.prediksi_label ?? null,
    owner,
  });
  if (!journal) {
    return next(new InvariantError('Jurnal gagal ditambahkan'));
  }

  const responseData = { journalId: journal };
  if (prediction) {
    responseData.prediction = prediction;
  }

  return response(res, 201, 'Jurnal berhasil ditambahkan', responseData);
};

export const getJournals = async (req, res) => {
  const { id: owner } = req.user;
  const journals = await journalRepositories.getJournals(owner);
  const mapped = Array.isArray(journals) ? journals.map(journalToModel) : [];

  return response(res, 200, 'Jurnal sukses ditampilkan', {
    journals: mapped,
  });
};

export const getJournalById = async (req, res, next) => {
  const { id } = req.params;
  const { id: owner } = req.user;

  const journalExists = await journalRepositories.getJournalById(id);

  if (!journalExists) {
    return next(new NotFoundError('Jurnal tidak ditemukan'));
  }

  const isOwner = await journalRepositories.verifyJournalOwner(id, owner);
  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak mengakses resource ini')
    );
  }

  return response(res, 200, 'Jurnal sukses ditampilkan', {
    journal: journalToModel(journalExists),
  });
};

export const editJournalById = async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.validated;
  const { id: owner } = req.user;

  const isOwner = await journalRepositories.verifyJournalOwner(id, owner);
  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak mengakses resource ini')
    );
  }

  const journal = await journalRepositories.editJournalById({
    id,
    title,
    content,
  });

  if (!journal) {
    return next(
      new NotFoundError('Gagal memperbarui jurnal. Id tidak ditemukan')
    );
  }

  return response(res, 200, 'Jurnal berhasil diperbarui', {
    journal: journalToModel(journal),
  });
};

export const deleteJournalById = async (req, res, next) => {
  const { id } = req.params;
  const { id: owner } = req.user;

  const isOwner = await journalRepositories.verifyJournalOwner(id, owner);
  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak mengakses resource ini')
    );
  }

  const deletedJournal = await journalRepositories.deleteJournalById(id);
  if (!deletedJournal) {
    return next(new NotFoundError('Jurnal gagal dihapus. Id tidak ditemukan'));
  }

  return response(res, 200, 'Jurnal berhasil dihapus', deletedJournal);
};

export const getWeeklyStress = async (req, res) => {
  const { id: owner } = req.user;
  const { start, end } = getWeekRange();

  const stressRows = await journalRepositories.getWeeklyStressLevels(
    owner,
    start,
    end
  );

  const stressMap = new Map();
  for (const row of stressRows) {
    const avgScore = parseFloat(row.average_score);
    stressMap.set(formatToYmd(new Date(row.date)), avgScore);
  }

  const monday = new Date(start);
  const stressLevels = WEEK_DAYS.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = formatToYmd(date);

    return {
      date: dateStr,
      day,
      averageScore: stressMap.get(dateStr),
    };
  });

  return response(res, 200, 'Stress level mingguan sukses ditampilkan', {
    stressLevels,
  });
};

export const getWeeklyEmotion = async (req, res) => {
  const { id: owner } = req.user;
  const { start, end } = getWeekRange();

  const emotionSummary = await journalRepositories.getWeeklyEmotionSummary(
    owner,
    start,
    end
  );

  return response(res, 200, 'Emosi mingguan sukses ditampilkan', {
    emotionSummary,
  });
};

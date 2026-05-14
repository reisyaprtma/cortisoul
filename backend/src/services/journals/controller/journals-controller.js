import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';
import journalRepositories from '../repositories/journal-repositories.js';
import AuthorizationError from '../../../exceptions/authorization-error.js';

export const createJournal = async (req, res, next) => {
  const { title, content } = req.validated;
  const { id: owner } = req.user;

  const journal = await journalRepositories.createJournal({
    title,
    content,
    owner,
  });
  if (!journal) {
    return next(new InvariantError('Jurnal gagal ditambahkan'));
  }

  return response(res, 201, 'Jurnal berhasil ditambahkan', {
    journalId: journal,
  });
};

export const getJournals = async (req, res) => {
  const { id: owner } = req.user;
  const journals = await journalRepositories.getJournals(owner);

  return response(res, 200, 'Jurnal sukses ditampilkan', {
    journals: journals,
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
    journal: journalExists,
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
    journal: journal,
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

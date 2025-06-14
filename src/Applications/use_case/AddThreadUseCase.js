const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { auth, payload } = useCasePayload;
    const { id: owner } = auth.credentials;
    const { title, body } = payload;

    const addThread = new AddThread({ title, body, owner});
    
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;

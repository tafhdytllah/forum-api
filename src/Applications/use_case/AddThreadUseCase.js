const AddThread = require('../../Domains/threads/entities/AddThread');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute({ title, body, userId}) {

    const addThread = new AddThread({ title, body, userId});
    
    const addedThread = await this._threadRepository.addThread(addThread);
    
    return new AddedThread(addedThread);
  }
}

module.exports = AddThreadUseCase;

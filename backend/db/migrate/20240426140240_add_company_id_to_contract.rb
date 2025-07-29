class Contract < ApplicationRecord
  self.table_name = 'contracts'
  CONSULTING_CONTRACT_NAME = Document::CONSULTING_CONTRACT_NAME
  belongs_to :company_contractor, class_name: 'CompanyWorker', optional: true
  belongs_to :company_administrator
end

class AddCompanyIdToContract < ActiveRecord::Migration[7.1]
  def change
    add_reference :contracts, :company

    up_only do
      Contract.reset_column_information
      Contract.find_each do |contract|
        administrator = contract.company_administrator
        contract.update_columns(company_id: administrator.company_id)
      end
    end

    change_column_null :contracts, :company_id, false
  end
end

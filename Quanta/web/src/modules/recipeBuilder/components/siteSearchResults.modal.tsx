type Result = {
  id: string;
  name: string;
  description: string;
  unit: string;
};

export async function AdvancedRecipeBuilderResultsModal({
  results,
  editResults,
  addToForm,
  onClose,
}: {
  results: Result[];
  editResults: (emptyArray: any[]) => void;
  addToForm: (result: Result) => void;
  onClose: () => void;
}) {
  function selectResult(result: Result) {
    addToForm(result);
    editResults([]);
    onClose();
  }

  if (results == null || results == undefined || results.length == 0) {
    return (
      <div>
        <p>Not Found</p>
      </div>
    );
  }; 

  return (
    <>
      <div>
        <ul>
          {results.map((result, key) => (
            <li key={key}>
              <div onClick={() => selectResult(result)}>
                <p>{result.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
